'use strict';

const mixinPayUrl = 'https://mixin.one/pay'; // merge to sushitrain // @todo
const chkCpVer = async () => { return await requestChainApi('GET', 'system'); };
const chkNwVer = async () => { return await shot.getVersionOnNpm('prs-atm'); };

const requestChainApi = async (method, path, urlArgs, body, error, ot) => {
    ot = ot || {};
    ot.headers = ot.headers || {};
    // ot.headers['User-Agent'] = 'prs-atm/2.0.0'; // keep this line for debug
    ot.headers['User-Agent'] = (await utilitas.which(global._prsAtm)).userAgent;
    return await sushibar.requestApi(method, path, urlArgs, body, error, ot);
};

const requestSushichef = async (method, path, urlArgs, body, error, option) => {
    option = option || {};
    option.api = testNet()
        ? global._prsAtm.testNetChainApi
        : utilitas.getConfigFromStringOrArray((await sushitrain.config(
            { basicConfigOnly: true, authority: true, config: {} }
        )).chainApi);
    return await requestChainApi(method, path, urlArgs, body, error, option);
};

const isTestRpcApi = (url) => {
    return utilitas.insensitiveCompare(url, global._prsAtm.testNetRpcApi);
};

const idTestChainApi = (url) => {
    return utilitas.insensitiveCompare(url, global._prsAtm.testNetChainApi)
};

const testNet = (argv = {}) => {
    global.chainConfig = global.chainConfig || {};
    argv.testnet = argv.testnet
        || isTestRpcApi(argv.rpcapi)
        || idTestChainApi(argv.chainapi)
        || isTestRpcApi(global.chainConfig.rpcApi)
        || idTestChainApi(global.chainConfig.chainApi);
    if (!argv.testnet) { return argv.testnet; }
    if (!argv.json && !global._prsAtm.loggedTest) {
        console.log('>>> 🌍 Running on testing network.');
    }
    global._prsAtm.loggedTest = true;
    global.chainConfig.rpcApi = argv.rpcapi
        = argv.rpcapi || global._prsAtm.testNetRpcApi;
    global.chainConfig.chainApi = argv.chainapi
        = argv.chainapi || global._prsAtm.testNetChainApi;
    return argv.testnet;
};

const magicPayment = async (url, options) => {
    if (options?.screening) {
        url = url.replace(mixinPayUrl, await sushibar.getApiUrl('finance/pay'));
    }
    if (testNet()) {
        const [uuid, recipient, asset] = [
            uoid.uuidRegTxt, global._prsAtm.testNetOfficialMixin,
            mixin.assetIds.CNB.id,
        ];
        const replace = { recipient };
        if (options?.cnb) { Object.assign(replace, { asset }); }
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

const {
    sushitrain, sushibar, utilitas, shot, uoid, mixin
} = require('sushitrain');
