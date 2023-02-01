import { default as cbfCreateTorrent } from 'create-torrent';
import { default as parseTorrent, remote, toMagnetURI, toTorrentFile } from 'parse-torrent';
import { promisify } from 'util';
import { utilitas } from 'utilitas';
import config from './config.mjs';
import webTorrent from 'webtorrent';
import prettierBytes from 'prettier-bytes';

const log = (content) => utilitas.log(content, import.meta.url);
const pmfCreateTorrent = promisify(cbfCreateTorrent);
const fatalError = (err) => { log(err.message || err); process.exit(1); };
const startTime = Date.now();
const getRuntime = () => Math.floor((Date.now() - startTime) / 1000);

let _client, _href, _playerName, _server, _drawInterval;

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
    const torrent = await pmfCreateTorrent(content, {
        announceList: options?.announce || (await config()).ptTrackers,
        comment: 'RUM Private Torrent',
        ...options || {}
    });
    const details = await parseTorrent(torrent);
    const magnet = toMagnetURI(details);
    return { torrent, details, magnet };
};

const getClient = (options) => _client || (_client = new webTorrent({
    blocklist: options?.blocklist,
    dhtPort: options?.['dht-port'],
    downloadLimit: options?.downloadLimit,
    torrentPort: options?.['torrent-port'],
    uploadLimit: options?.uploadLimit,
}));

const drawTorrent = (torrent, options) => {
    const draw = () => {
        let [linesRemaining, peerslisted] = [process.stdout.rows, 0];
        const unchoked = torrent.wires.filter(wire => !wire.peerChoking);
        const line = (...args) => { console.log(...args); linesRemaining -= 1; };
        const runtimeSeconds = getRuntime();
        const [seeding, speed] = [torrent.done, torrent.downloadSpeed];
        const estimate = torrent.timeRemaining
            ? moment.duration(torrent.timeRemaining / 1000, 'seconds').humanize()
            : 'N/A';
        const runtime = runtimeSeconds > 300
            ? moment.duration(getRuntime(), 'seconds').humanize()
            : `${runtimeSeconds} seconds`;
        const r = (k, v) => line([k.padEnd(
            maxKeyLength = Math.max(maxKeyLength, k.length), ' '
        ), v].join(' : '));
        console.clear();
        r(seeding ? 'Seeding' : 'Downloading', torrent.name);
        seeding && r('Info hash', torrent.infoHash);
        options?.['torrent-port'] && r('Torrent port', options['torrent-port']);
        options?.['dht-port'] && r('DHT port', options['dht-port']);
        if (_playerName) {
            [
                ['Streaming to', _playerName],
                ['Server running at', _href],
            ].map(r(x[0], x[1]));
        } else if (_server) { r('Server running at', _href); }
        options?.out && r('Downloading to', options?.out);
        [
            ['Speed', `${prettierBytes(speed)}/s`],
            ['Downloaded', `${prettierBytes(torrent.downloaded)} / ${prettierBytes(torrent.length)}`],
            ['Uploaded', prettierBytes(torrent.uploaded)],
            ['Running time', runtime],
            ['Time remaining', estimate],
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

// https://github.com/webtorrent/webtorrent-cli/blob/master/bin/cmd.js
const seed = async (input, options) => {
    // if (path.extname(input).toLowerCase() === '.torrent' || /^magnet:/.test(input)) {
    //     // `seed` is meant for creating a new torrent based on a file or folder
    //     // of content, not a torrent id (.torrent or a magnet uri). If this command is used
    //     // incorrectly, let's just do the right thing.
    //     runDownload(input)
    //     return
    // }
    const client = getClient(options);
    const tks = (await config()).ptTrackers;
    client.on('error', fatalError);
    const torrent = await new Promise((resolve, reject) => {
        try {
            client.seed(input, { announce: options?.announce || tks }, resolve);
        } catch (err) { reject(err); }
    });
    log(`Seeding: ${torrent.name}`);
    log(`Magnet: ${torrent.magnetURI}`);
    drawTorrent(torrent, options);
};

export {
    createTorrent,
    getClient,
    parseTorrent,
    remote,
    seed,
    toMagnetURI,
    toTorrentFile,
};
