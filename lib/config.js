'use strict';

const { utilitas } = require('utilitas');

module.exports = (options) => {

    return utilitas.mergeAtoB(options || global.chainConfig, {

        debug: false,

        secret: false,

        speedTest: false,

        serviceStateHistoryPlugin: false,

        serviceTransactionArchive: false,

        serviceDefiPricesSubmit: false,

        serviceDefiPricesWatch: false,

        serviceDefiPricesArchive: false,

        keosApi: [
            'http://127.0.0.1:8900',
        ],

        rpcApi: [
            'http://5.135.106.40:8888',
            'http://149.56.70.124:8888',
            'http://51.38.161.232:8888',
        ],

        shpApi: [
            'ws://5.135.106.40:8080',
            'ws://149.56.70.124:8080',
            'ws://51.38.161.232:8080',
        ],

        preserveIds: [
            'pressone',
            'press.one',
            'admin',
            'administrator',
            'root',
        ],

        accounts: null,

        database: null,

    });

};
