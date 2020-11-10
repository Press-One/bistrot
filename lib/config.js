'use strict';

const { utilitas, storage } = require('sushitrain');

const getUserConfig = storage.getConfig;

const allowed = ['debug', 'secret', 'speedTest'];

const defaultConfig = {

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
    const { config } = await getUserConfig();
    const result = utilitas.mergeAtoB(utilitas.mergeAtoB(
        options || global.chainConfig || {}, config), defaultConfig);
    return result;
};

const set = async (input) => {
    const data = {};
    for (let i in input || {}) {
        utilitas.assert(allowed.includes(i),
            `'${i}' is not allowed to configure.`, 400);
        data[i] = input[i];
    }
    return storage.setConfig(data);
};

Object.assign(get, { set });

module.exports = get;
