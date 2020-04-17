'use strict';

const utility = require('./utility');
const config = require('./config');

for (let i in global.prsAtmConfig || {}) {
    config[i] = typeof global.prsAtmConfig[i] === 'undefined'
        ? config[i] : global.prsAtmConfig[i];
}

const getChainApiUrl = () => {
    return utility.isArray(config.chainApi)
        ? config.chainApi[utility.getRandomInt(config.chainApi.length)]
        : config.chainApi;
};

const assembleApiUrl = (host, path, args) => {
    return utility.assembleUrl(`${host}/${path}`, args);
};

const assembleChainApiUrl = (path, args) => {
    return assembleApiUrl(getChainApiUrl(), `api/${path}`, args);
};

const assembleIpfsApiUrl = (path, args) => {
    return assembleApiUrl(config.ipfsApi, `api/v0/${path}`, args);
};

const assembleMixinApiUrl = (path, args) => {
    return assembleApiUrl('https://mixin.one/', path, args);
};

module.exports = {
    assembleChainApiUrl,
    assembleIpfsApiUrl,
    assembleMixinApiUrl,
};
