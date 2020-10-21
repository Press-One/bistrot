'use strict';

const { utilitas } = require('utilitas');

module.exports = utilitas.mergeAtoB(global.chainConfig, {

    debug: false,

    secret: false,

    speedTest: false,

    serviceStateHistoryPlugin: false,

    serviceTransactionArchive: false,

    serviceDefiPricesSubmit: false,

    serviceDefiPricesWatch: false,

    serviceDefiPricesArchive: false,

    rpcApi: [
        'http://5.135.106.40:8888',
        'http://149.56.70.124:8888',
        'http://51.38.161.232:8888',
    ],

    shpApi: [
        'ws://5.135.106.40:8888',
        'ws://149.56.70.124:8888',
        'ws://51.38.161.232:8888',
    ],

    accounts: null,

    database: null,

});
