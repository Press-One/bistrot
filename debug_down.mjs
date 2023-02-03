'use strict';

const lib = await import('./index.mjs');

lib.torrent.seed('magnet:?xt=urn:btih:79913029e558d7f1321089d06affc1808d505e72&dn=lego.jurassic.world.the.legend.of.isla.nublar.s01e02.stampede.internal.720p.hdtv.x264-w4f.mkv&tr=http%3A%2F%2Flocalhost%3A8000%2Fannounce&tr=udp%3A%2F%2Flocalhost%3A8000&tr=ws%3A%2F%2Flocalhost%3A8000', { callback: console.log });
