'use strict';

const lib = await import('./index.mjs');

lib.torrent.init();

const x = await lib.torrent.seed('/Users/leask/Desktop/warriors.of.future.2022.1080p.web.h264-kogi.sample.mkv', { callback: console.log });

// console.log(x);
