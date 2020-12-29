'use strict';

const { sushibar, utilitas, shot } = require('sushitrain');

const chkCpVer = async () => { return await requestChainApi('GET', 'system'); };
const chkNwVer = async () => { return await shot.getVersionOnNpm('prs-atm'); };

const requestChainApi = async (method, path, urlArgs, body, error, opts) => {
    opts = opts || {};
    opts.headers = opts.headers || {};
    // opts.headers['User-Agent'] = 'prs-atm/2.0.0'; // keep this line for debug
    opts.headers['User-Agent'] = (await utilitas.which()).userAgent;
    return await sushibar.requestApi(method, path, urlArgs, body, error, opts);
};

const checkVersion = async () => {
    await chkCpVer();
    const chkVer = await shot.checkVersion();
    return chkVer && chkVer.updateAvailable ? chkVer : false;
};

module.exports = {
    chkCpVer,
    chkNwVer,
    checkVersion,
    requestChainApi,
};
