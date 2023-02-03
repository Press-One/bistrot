'use strict';

const lib = await import('./index.mjs');

lib.torrent.seed('/Users/leask/Documents/pt/lego.jurassic.world.the.legend.of.isla.nublar.s01e02.stampede.internal.720p.hdtv.x264-w4f.mkv', { callback: console.log });
