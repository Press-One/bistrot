// https://webtorrent.io/docs

import { default as cbfCreateTorrent } from 'create-torrent';
import { default as parseTorrent, remote, toMagnetURI, toTorrentFile } from 'parse-torrent';
import { join } from 'path';
import { promisify } from 'util';
import { tmpdir } from 'os';
import { utilitas, encryption, luxon, portfinder } from 'utilitas';
import config from './config.mjs';
import prettierBytes from 'prettier-bytes';
import webTorrent from 'webtorrent';

const log = (content) => utilitas.log(content, import.meta.url);
const pmfCreateTorrent = promisify(cbfCreateTorrent);
const handleError = (err) => { log(err.message || err); process.exit(1); };
const handleWarning = (err) => { log(`Warning: ${err.message || err}`); };
const startTime = Date.now();
const getRuntime = () => Math.floor((Date.now() - startTime) / 1000);
const duration = (m) => luxon.Duration.fromObject({ seconds: m }).toHuman();
const getTempPath = (torrentId) => join(tmpdir(), encryption.hash(torrentId));
const pathname = '/rum-pt';

let _client, _hrefs, _server, _drawInterval;

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
        announceList: options?.announce || [(await config()).ptTrackers],
        comment: 'RUM Private Torrent',
        ...options || {}
    });
    const details = await parseTorrent(torrent);
    const magnet = toMagnetURI(details);
    return { torrent, details, magnet };
};

const getClient = (options) => {
    if (!_client) {
        _client = new webTorrent({
            blocklist: options?.blocklist,
            dhtPort: options?.['dht-port'],
            downloadLimit: options?.downloadLimit,
            torrentPort: options?.['torrent-port'],
            uploadLimit: options?.uploadLimit,
        });
        _client.on('error', handleError);
    }
    return _client;
};

const drawTorrent = (torrent, options) => {
    const draw = () => {
        let [linesRemaining, peerslisted] = [process.stdout.rows, 0];
        const unchoked = torrent.wires.filter(wire => !wire.peerChoking);
        const line = (...args) => { console.log(...args); linesRemaining -= 1; };
        const [seeding, speed] = [torrent.done, torrent.downloadSpeed];
        const r = (k, v) => line([k.padEnd(
            maxKeyLength = Math.max(maxKeyLength, k.length), ' '
        ), v].join(' : '));
        console.clear();
        r(seeding ? 'Seeding' : 'Downloading', torrent.name);
        r('Magnet', torrent.magnetURI);
        seeding && r('Info hash', torrent.infoHash);
        options?.['torrent-port'] && r('Torrent port', options['torrent-port']);
        options?.['dht-port'] && r('DHT port', options['dht-port']);
        if (_server) { r('Server running at', JSON.stringify(_hrefs)); }
        options?.out && r('Downloading to', options?.out);
        [
            ['Speed', `${prettierBytes(speed)}/s`],
            ['Downloaded', `${prettierBytes(torrent.downloaded)} / ${prettierBytes(torrent.length)}`],
            ['Uploaded', prettierBytes(torrent.uploaded)],
            ['Running time', duration(getRuntime())],
            ['Time remaining', torrent.timeRemaining ? duration(torrent.timeRemaining / 1000) : 'N/A'],
            ['Peers', `${unchoked.length} / ${torrent.numPeers}`],
            ['Queued peers', torrent._numQueued],
            ['Blocked peers', blockedPeers],
            ['Hotswaps', hotswaps],
            '',
        ].map(x => Array.isArray(x) ? r(x[0], x[1]) : line(x));
        torrent.wires.every(wire => {
            let [progress, tags] = ['?', []];
            if (torrent.length) {
                let bits = 0;
                const piececount = Math.ceil(torrent.length / torrent.pieceLength);
                for (let i = 0; i < piececount; i++) {
                    wire.peerPieces.get(i) && bits++;
                }
                progress = bits === piececount
                    ? 'S' : `${Math.floor(100 * bits / piececount)}%`;
            }
            wire.requests.length > 0 && tags.push(`${wire.requests.length} reqs`);
            wire.peerChoking && tags.push('choked');
            line(...[].concat('%s %s %s %s %s %s %s', [
                progress.padEnd(3),
                (wire.remoteAddress
                    ? `${wire.remoteAddress}:${wire.remotePort}`
                    : 'Unknown').padEnd(25),
                prettierBytes(wire.downloaded).padEnd(10),
                (prettierBytes(wire.downloadSpeed()) + '/s').padEnd(12),
                (prettierBytes(wire.uploadSpeed()) + '/s').padEnd(12),
                tags.join(', ').padEnd(15),
                wire.requests.map(req => req.piece).join(' ').padEnd(10),
            ]));
            peerslisted += 1;
            return linesRemaining > 4;
        });
        line(''.padEnd(60));
        torrent.numPeers > peerslisted
            && line('... and %s more', torrent.numPeers - peerslisted);
    };
    let [maxKeyLength, hotswaps, blockedPeers] = [0, 0, 0];
    torrent.on('hotswap', () => (hotswaps += 1));
    torrent.on('blockedPeer', () => (blockedPeers += 1));
    // https://httptoolkit.com/blog/unblocking-node-with-unref/
    console.clear();
    (_drawInterval = setInterval(draw, 1000)).unref();
};

// Reference:
// https://github.com/webtorrent/webtorrent-cli/blob/master/bin/cmd.js
const seed = async (input, options) => {
    const client = getClient(options);
    const tks = (await config()).ptTrackers.flat();
    const torrent = await new Promise((resolve, reject) => {
        try {
            client.seed(input, { announce: options?.announce || tks }, resolve);
        } catch (err) { reject(err); }
    });
    drawTorrent(torrent, options);
    return torrent;
};

// Reference:
// https://github.com/webtorrent/webtorrent-cli/blob/master/bin/cmd.js
const download = async (torrentId, options) => {
    options = { out: getTempPath(torrentId), ...options || {} };
    const client = getClient(options);
    const tks = (await config()).ptTrackers;
    const torrent = client.add(torrentId, {
        path: options.out, announce: options.announce || tks,
    });
    torrent.on('warning', handleWarning);
    torrent.on('infoHash', () => {
        if ('select' in options) { torrent.so = options.select.toString(); }
        const updateMetadata = () => {
            console.clear()
            log(`fetching torrent metadata from ${torrent.numPeers} peers`);
        };
        updateMetadata();
        torrent.on('wire', updateMetadata);
        torrent.on('metadata', () => {
            console.clear()
            torrent.removeListener('wire', updateMetadata);
            console.clear()
            log('Verifying existing torrent data...');
        });
    });
    torrent.on('done', () => {
        const numActiveWires = torrent.wires.reduce((num, wire) => num + (wire.downloaded > 0), 0);
        log(`\ntorrent downloaded successfully from ${numActiveWires}/${torrent.numPeers} peers in ${getRuntime()}s!`);
    });
    const ready = async () => {
        if (options.select && typeof options.select !== 'number') {
            log('Select a file to download:');
            torrent.files.forEach((file, i) => console.log(
                `%s %s (%s)`,
                i.toString().padEnd(2), file.name, prettierBytes(file.length)
            ));
            log('\nTo select a specific file, re-run `bistrot ptdown` with "--select [index]"');
            log("Example: bistrot ptdown 'magnet:...' --select 0");
            return handleError('Invalid file index.');
        }
        // if no index specified, use largest file
        const index = (typeof options.select === 'number')
            ? options.select
            : torrent.files.indexOf(torrent.files.reduce((a, b) => a.length > b.length ? a : b));
        if (!torrent.files[index]) {
            return handleError(`There's no file that maps to index: ${index}.`);
        }
        const baseUrl = `http://localhost:${_server.address().port}${pathname}/`;
        _hrefs = [];
        torrent.files.forEach((file, i) => {
            _hrefs.push(`${baseUrl}${torrent.infoHash}/${encodeURIComponent(file.path)}`);
        });
        drawTorrent(torrent);
    };
    _server = client.createServer({ pathname }).server;
    _server.listen(await portfinder.getPortPromise()).on('error', handleError);
    _server.once('listening', () => torrent.ready ? ready() : torrent.once('ready', ready));
};

export {
    createTorrent,
    getClient,
    parseTorrent,
    remote,
    seed,
    download,
    toMagnetURI,
    toTorrentFile,
};
