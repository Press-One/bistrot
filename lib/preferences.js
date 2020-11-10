'use strict';

const { utilitas, storage } = require('sushitrain');

const getUserConfig = storage.getConfig;

const config = {

    debug: false,

    secret: false,

    speedTest: false,

    ipfsApi: 'http://127.0.0.1:5001',

    chainApi: [
        'https://prs-bp1.press.one',
        'https://prs-bp2.press.one',
        'https://prs-bp3.press.one',
    ],

};

const get = async (options) => {
    const result = utilitas.mergeAtoB(utilitas.mergeAtoB(options
        || global.chainConfig || {}, await getUserConfig()), config);
    return result;
};

const set = async (data) => {
    return storage.setConfig(data);
};

module.exports = get;
