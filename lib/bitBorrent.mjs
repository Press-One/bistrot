import { default as cbfCreateTorrent } from 'create-torrent';
import { default as parseTorrent, toMagnetURI, toTorrentFile, remote } from 'parse-torrent';
import { promisify } from 'util';
import config from './config.mjs';

const pmfCreateTorrent = promisify(cbfCreateTorrent);

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

export {
    createTorrent,
    parseTorrent,
    remote,
    toMagnetURI,
    toTorrentFile,
};
