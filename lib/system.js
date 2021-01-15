'use strict';

const { sushibar, utilitas, shot, mixin } = require('sushitrain');

const chkCpVer = async () => { return await requestChainApi('GET', 'system'); };
const chkNwVer = async () => { return await shot.getVersionOnNpm('prs-atm'); };

const requestChainApi = async (method, path, urlArgs, body, error, ot) => {
    ot = ot || {};
    ot.headers = ot.headers || {};
    // ot.headers['User-Agent'] = 'prs-atm/2.0.0'; // keep this line for debug
    ot.headers['User-Agent'] = (await utilitas.which(global._prsAtm)).userAgent;
    return await sushibar.requestApi(method, path, urlArgs, body, error, ot);
};

const requestSushichef = async (method, path, urlArgs, body, error, ot) => {
    ot = ot || {};
    ot.headers = ot.headers || {};
    // ot.headers['User-Agent'] = 'prs-atm/2.0.0'; // keep this line for debug
    ot.headers['User-Agent'] = (await utilitas.which(global._prsAtm)).userAgent;
    utilitas.assert(method && path, 'Invalid chain api requesting args.', 400);
    let api = testNet(
    ) ? global._prsAtm.authorityChainApi : global._prsAtm.testNetChainApi;
    api = path ? utilitas.assembleApiUrl(api, `api/${path}`, urlArgs) : api;
    const req = { method: method, ...ot };
    if (body) { req.body = body; }
    const result = await fetch(api, req).then(res => res.json());
    utilitas.assert(
        result && result.data && !result.error,
        error || result.error || 'Error querying chain api.', 500
    );
    return result.data;
};

const isTestRpcApi = (url) => {
    return utilitas.insensitiveCompare(url, global._prsAtm.testNetRpcApi);
};

const idTestChainApi = (url) => {
    return utilitas.insensitiveCompare(url, global._prsAtm.testNetChainApi)
};

const testNet = (arg = {}) => {
    global.chainConfig = global.chainConfig || {};
    arg.testnet = arg.testnet
        || isTestRpcApi(arg.rpcapi)
        || idTestChainApi(arg.chainapi)
        || isTestRpcApi(global.chainConfig.rpcApi)
        || idTestChainApi(global.chainConfig.chainApi);
    if (!arg.testnet) { return arg.testnet; }
    if (!arg.json && !global._prsAtm.loggedTest) {
        console.log('>>> 🌍 Running on testing network.');
    }
    global._prsAtm.loggedTest = true;
    global.chainConfig.rpcApi = arg.rpcapi = global._prsAtm.testNetRpcApi;
    global.chainConfig.chainApi = arg.chainapi = global._prsAtm.testNetChainApi;
    return arg.testnet;
};

const magicPayment = (url, options) => {
    if (testNet()) {
        options = options || {};
        const [uuid, recipient, asset] = [
            '[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}',
            '14da6c0c-0cbf-483c-987a-c44477dcad1b',
            mixin.assetIds.CNB.id,
        ];
        const replace = { recipient };
        if (options.cnb) { Object.assign(replace, { asset }); }
        for (let i in replace) {
            url = url.replace(
                new RegExp(`(^.*${i}=)${uuid}(&.*$)`, 'i'), `$1${replace[i]}$2`
            );
        }
    }
    return url;
};

module.exports = {
    chkCpVer,
    chkNwVer,
    magicPayment,
    requestChainApi,
    requestSushichef,
    testNet,
};
