// Reference:
// https://webtorrent.io/docs
// https://github.com/webtorrent/webtorrent-cli/blob/master/bin/cmd.js

import { default as cbfCreateTorrent } from 'create-torrent';
import { default as parseTorrent, toMagnetURI } from 'parse-torrent';
import { createHash } from 'crypto';
import { Duration } from 'luxon';
import { getPortPromise } from 'portfinder';
import { join } from 'path';
import { promisify } from 'util';
import { tmpdir } from 'os';
import prettierBytes from 'prettier-bytes';
import webTorrent from 'webtorrent';

const [comment, pathname] = ['RUM Private Torrent', '/rum-pt'];
const duration = seconds => Duration.fromObject({ seconds }).toHuman();
const getDuration = options => duration(getRuntime(options));
const getRuntime = start => Math.floor(start ? (Date.now() - start) / 1000 : 0);
const getTempPath = torrentId => join(tmpdir(), sha256(torrentId));
const handleError = err => { log(err.message || err); process.exit(1); };
const handleWarning = err => log(`Warning: ${err.message || err}`);
const log = content => console.log(`[TORRENT] ${content}`);
const pmfCreateTorrent = promisify(cbfCreateTorrent);
const sha256 = string => createHash('sha256').update(string).digest('hex');
const splitLine = () => console.log(''.padEnd(process.stdout.columns, '-'));
const renderSplit = ' : ';
// @TODO by @Leaskh: A bug related to webtorrent, this api will remove all jobs.
// const remove = (torrentId, opts) => _client && _client.remove(torrentId, opts);

// @TODO by @Leaskh: FAKE TOKEN FOR TEST
const token = 'f09c65ede8247a992862d1079c573749';

const announce = [
    `http://localhost:8965/announce/${token}`,
];

const ignore = new Set([
    'blockedPeers', 'downloaded', 'hotswaps', 'infoHash', 'name', 'peers',
    'queuedPeers', 'runningTime', 'speed', 'status', 'timeRemaining', 'uploaded',
]);

let _client, _timer, _callback, _maxKeyLength = 0;

// https://github.com/webtorrent/create-torrent
// OPTIONS:
// {
//   name: String,             // name of the torrent (default = basename of `path`, or 1st file's name)
//   comment: String,          // free-form textual comments of the author
//   createdBy: String,        // name and version of program used to create torrent
//   creationDate: Date        // creation time in UNIX epoch format (default = now)
//   filterJunkFiles: Boolean, // remove hidden and other junk files? (default = true)
//   private: Boolean,         // is this a private .torrent? (default = false)
//   pieceLength: Number,      // force a custom piece length (number of bytes)
//   announceList: [[String]], // custom trackers (array of arrays of strings) (see [bep12](http://www.bittorrent.org/beps/bep_0012.html))
//   urlList: [String],        // web seed urls (see [bep19](http://www.bittorrent.org/beps/bep_0019.html))
//   info: Object,             // add non-standard info dict entries, e.g. info.source, a convention for cross-seeding
//   onProgress: Function      // called with the number of bytes hashed and estimated total size after every piece
// }
const createTorrent = async (content, options) => {
    options?.announce && assert(
        Array.isArray(options.announce?.[0]), 'Invalid tracker list.', 400
    );
    const torrent = await pmfCreateTorrent(content, {
        announceList: options?.announce || [announce], comment, ...options || {}
    });
    const details = await parseTorrent(torrent);
    const magnet = toMagnetURI(details);
    return { torrent, details, magnet };
};

const getStreamingAddress = (subPath) =>
    `http://localhost:${_client._server.server.address().port}/${pathname}` + (
        subPath ? `/${subPath}` : ''
    );

const getClient = async (options) => {
    if (!_client) {
        _client = new webTorrent({
            blocklist: options?.blocklist,
            dhtPort: options?.dhtPort,
            downloadLimit: options?.downloadLimit,
            torrentPort: options?.torrentPort,
            uploadLimit: options?.uploadLimit,
        });
        _client.on('error', handleError);
        _client.createServer({ pathname });
        _client._server.server.listen(options?.httpPort || await getPortPromise());
        _client._server.server.on('error', handleError);
        _client._server.server.once('listening', () => log(
            `Streaming service is up: ${getStreamingAddress()}.`
        ));
    }
    return _client;
};

const render = (status) => {
    console.clear();
    status.torrents.map(r => {
        splitLine();
        const t = {
            [r.status]: r.name,
            throughput: `speed: ${r.speed}, rx: ${r.downloaded}, tx: ${r.uploaded}`,
            time: `running: ${r.runningTime}, remaining: ${r.timeRemaining}`,
            network: `peers: ${r.peers}, queued: ${r.queuedPeers}, blocked: ${r.blockedPeers}, hotswaps: ${r.hotswaps}`,
            ...r,
        };
        for (let k in t) {
            if (ignore.has(k)) { continue; }
            _maxKeyLength = Math.max(_maxKeyLength, k.length);
            const available = process.stdout.columns - _maxKeyLength - renderSplit.length;
            const v = Array.isArray(t[k]) ? (t[k].length ? t[k] : ['']) : [t[k]];
            for (let i in v) {
                const [sV, more] = [String(v[i]), ~~i > 2];
                const rV = [];
                if (more) {
                    rV.push(`*   ${v.length - 3} more item(s)...`);
                } else {
                    const pV = sV.split('');
                    while (pV.length) {
                        rV.push(pV.splice(0, available).join(''));
                    }
                }
                rV.map((dV, dI) => console.log([
                    (~~i || ~~dI ? '' : k).padEnd(_maxKeyLength, ' '), dV
                ].join(renderSplit)));
                if (more) { break; }
            }
        }
    });
    splitLine();
};

const init = async (options) => {
    await getClient(options);
    _callback = options?.callback;
    _timer = setInterval(() => (_callback || render)(
        summarize(options)
    ), 1000).unref(); // https://httptoolkit.com/blog/unblocking-node-with-unref/
};

const end = () => {
    _timer && clearInterval(_timer);
    if (!_client) { return; }
    _client._server.server.close();
    _client.destroy();
};

const summarize = () => {
    return {
        peerId: _client.peerId,
        nodeId: _client.nodeId,
        dhtPort: _client.dhtPort,
        httpPort: _client._server.server.address().port,
        torrentPort: _client.torrentPort || null,
        torrents: _client.torrents.map(torrent => {
            return {
                status: torrent.done ? 'SEEDING' : 'DOWNLOADING',
                name: torrent.name,
                infoHash: torrent.done ? torrent.infoHash : null, // @todo: check if this is correct
                magnet: torrent.magnetURI,
                speed: `${prettierBytes(torrent?.downloadSpeed || 0)}/s`,
                path: torrent?.memory?.path || null,
                downloaded: `${prettierBytes(torrent?.downloaded || 0)} / ${prettierBytes(torrent?.length || 0)}`,
                uploaded: prettierBytes(torrent?.uploaded || 0),
                runningTime: getDuration(torrent?.memory?.startTime),
                timeRemaining: torrent.timeRemaining ? duration(torrent.timeRemaining / 1000) : 'N/A',
                trackers: torrent.announce,
                peers: `${torrent.wires.filter(wire => !wire.peerChoking).length} / ${torrent.numPeers}`,
                queuedPeers: torrent._numQueued,
                blockedPeers: torrent?.memory?.blockedPeers || 0,
                hotswaps: torrent?.memory?.hotswaps || 0,
                files: torrent.files.map(file => getStreamingAddress(
                    join(torrent.infoHash, encodeURIComponent(file.path))
                )),
                wires: torrent.wires.map(wire => {
                    let [progress, tags] = ['?', []];
                    if (torrent.length) {
                        let bits = 0;
                        const piececount = Math.ceil(
                            torrent.length / torrent.pieceLength
                        );
                        for (let i = 0; i < piececount; i++) {
                            wire.peerPieces.get(i) && bits++;
                        }
                        progress = bits === piececount
                            ? 'S' : `${Math.floor(100 * bits / piececount)}%`;
                    }
                    wire.requests.length > 0 && tags.push(`${wire.requests.length} reqs`);
                    wire.peerChoking && tags.push('choked');
                    return [
                        progress.padEnd(3),
                        (wire.remoteAddress
                            ? `${wire.remoteAddress}:${wire.remotePort}`
                            : 'Unknown').padEnd(25),
                        prettierBytes(wire.downloaded).padEnd(10),
                        (prettierBytes(wire.downloadSpeed()) + '/s').padEnd(12),
                        (prettierBytes(wire.uploadSpeed()) + '/s').padEnd(12),
                        tags.join(', ').padEnd(15),
                        wire.requests.map(req => req.piece).join(' ').padEnd(10),
                    ].join(' ');
                }),
            }
        }),
    };
};

// https://github.com/webtorrent/webtorrent/blob/d31670e81c627bd10176e1dacaa01039c3a13e97/index.js#L236
// https://github.com/webtorrent/webtorrent/blob/d31670e81c627bd10176e1dacaa01039c3a13e97/index.js#L282
const seed = async (input, options) => {
    const fromMeta = /^magnet:|\.torrent$/ig.test(input);
    const client = await getClient(options);
    options = {
        announce, path: fromMeta ? getTempPath(input) : input, ...options || {},
    };
    const torrent = fromMeta ? client.add(input, options)
        : await new Promise((resolve, reject) => {
            try { client.seed(input, options, resolve); }
            catch (err) { reject(err); }
        });
    const updateMetadata = () => log(
        `Fetching metadata from ${torrent.numPeers} peers...`
    );
    torrent.memory = {
        blockedPeers: 0, hotswaps: 0, path: options.path, startTime: Date.now(),
    };
    torrent.on('hotswap', () => torrent.memory.hotswaps += 1);
    torrent.on('blockedPeer', () => torrent.memory.blockedPeers += 1);
    torrent.on('warning', handleWarning);
    torrent.on('infoHash', () => {
        options?.select && (torrent.so = options.select.toString());
        updateMetadata();
    });
    torrent.on('wire', updateMetadata);
    torrent.on('metadata', () => {
        torrent.removeListener('wire', updateMetadata);
        log('Verifying existing data...');
    });
    torrent.on('done', () => log(
        `Downloaded successfully from ${torrent.wires.reduce(
            (num, wire) => num + (wire.downloaded > 0), 0
        )}/${torrent.numPeers} peers in ${getDuration(torrent.memory.startTime)}.`
    ));
    torrent.once('ready', () => log(`Task ${torrent.name} is ready to stream.`));
    return torrent;
};

export {
    // remove,
    createTorrent,
    end,
    getClient,
    init,
    parseTorrent,
    seed,
    toMagnetURI,
};
