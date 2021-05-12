'use strict';

const pOpt = (opts) => { return { ...opts || {}, pack: global._prsAtm }; };
const getUserConfig = async (o) => { return await storage.getConfig(pOpt(o)); };
const allowed = ['debug', 'secret', 'speedTest', 'email'];
const defaultConfig = { debug: false, secret: false, speedTest: false };

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
    return storage.setConfig(data, pOpt(options));
};

Object.assign(get, { allowed, getUserConfig, set });

module.exports = get;

const { utilitas, storage } = require('sushitrain');
