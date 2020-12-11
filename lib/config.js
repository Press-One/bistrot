'use strict';

const { utilitas, storage } = require('sushitrain');

const getUserConfig = storage.getConfig;
const allowed = ['debug', 'secret', 'speedTest', 'email'];

const defaultConfig = {

    debug: false,

    secret: false,

    speedTest: false,

    ipfsApi: 'http://127.0.0.1:5001',

};

const get = async (args) => {
    const { config } = await getUserConfig();
    const result = utilitas.mergeAtoB(utilitas.mergeAtoB(
        args || global.chainConfig || {}, config), defaultConfig);
    return result;
};

const set = async (input, options) => {
    options = options || {};
    const data = {};
    for (let i in input || {}) {
        utilitas.assert([...allowed, ...(options.allowed || [])].includes(i),
            `'${i}' is not allowed to configure.`, 400);
        data[i] = input[i];
    }
    return storage.setConfig(data, options);
};

Object.assign(get, { allowed, getUserConfig, set });

module.exports = get;
