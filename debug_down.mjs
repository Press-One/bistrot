'use strict';

const lib = await import('./index.mjs');

lib.torrent.init();

const x = await lib.torrent.seed('magnet:?xt=urn:btih:ef172cabce78e5be02149b21fafc3303cd7d0f7b&dn=warriors.of.future.2022.1080p.web.h264-kogi.sample.mkv&tr=http%3A%2F%2Flocalhost%3A8965%2Fannounce%2Ff09c65ede8247a992862d1079c573749', { callback: console.log });

// console.log(x);
