'use strict';

const { utilitas } = require('utilitas');

module.exports = utilitas.mergeAtoB(global.chainConfig, {

    debug: false,

    speedTest: false,

    serviceStateHistoryPlugin: false,

    serviceTransactionArchive: false,

    rpcApi: [
        'http://51.68.201.144:8888',
        'http://51.75.56.51:8888',
        'http://5.135.106.40:8888',
        'http://149.56.70.124:8888'
    ],

    shpApi: [
        'ws://51.68.201.144:8080',
        'ws://149.56.70.124:8080',
    ],

    accounts: null,

    database: null,

});
