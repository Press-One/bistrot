'use strict';

const utility = require('./utility');
const config = require('./config');

for (let i in global.prsAtmConfig || {}) {
    config[i] = typeof global.prsAtmConfig[i] === 'undefined'
        ? config[i] : global.prsAtmConfig[i];
}

const getApiUrl = () => {
    return utility.isArray(config.chainApi)
        ? config.chainApi[utility.getRandomInt(config.chainApi.length)]
        : config.chainApi;
};

module.exports = {
    getApiUrl,
};
