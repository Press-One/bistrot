'use strict';

const { utilitas } = require('sushitrain');
const config = require('./config');

// @todo: changed from sync to async!
const assembleIpfsApiUrl = async (path, args) => {
    const pfncs = await config();
    return utilitas.assembleApiUrl(pfncs.ipfsApi, `api/v0/${path}`, args);
};

module.exports = {
    assembleIpfsApiUrl,
};
