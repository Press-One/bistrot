import { utilitas, shot, uoid } from 'utilitas';
import * as mixin from './mixin.mjs';
import * as sushibar from './sushibar.mjs';
import config from './config.mjs';

const chkCpVer = async () => { return await requestChainApi('GET', 'system'); };
const chkNwVer = async () => { return await shot.getVersionOnNpm('bistrot'); };

const requestChainApi = async (method, path, urlArgs, body, error, ot) => {
    ot = ot || {};
    ot.headers = ot.headers || {};
    // ot.headers['User-Agent'] = 'bistrot/7.0.0'; // keep this line for debug
    ot.headers['User-Agent'] = (await utilitas.which(global._bistrot)).userAgent;
    return await sushibar.requestApi(method, path, urlArgs, body, error, ot);
};

const requestSushichef = async (method, path, urlArgs, body, error, option) => {
    option = option || {};
    option.api = testNet()
        ? global._bistrot.testNetChainApi
        : utilitas.getConfigFromStringOrArray((await config(
            { basicConfigOnly: true, authority: true, config: {} }
        )).chainApi);
    return await requestChainApi(method, path, urlArgs, body, error, option);
};

const isTestRpcApi = (url) => {
    return utilitas.insensitiveCompare(url, global._bistrot.testNetRpcApi);
};

const isTestChainApi = (url) => {
    return utilitas.insensitiveCompare(url, global._bistrot.testNetChainApi)
};

const testNet = (argv = {}) => {
    global.chainConfig = global.chainConfig || {};
    argv.testnet = argv.testnet
        || isTestRpcApi(argv.rpcapi)
        || isTestChainApi(argv.chainapi)
        || isTestRpcApi(global.chainConfig.rpcApi)
        || isTestChainApi(global.chainConfig.chainApi);
    if (!argv.testnet) { return argv.testnet; }
    if (!argv.json && !global._bistrot.loggedTest) {
        console.log('>>> 🌍 Running on testing network.');
    }
    global._bistrot.loggedTest = true;
    global.chainConfig.rpcApi = argv.rpcapi
        = argv.rpcapi || global._bistrot.testNetRpcApi;
    global.chainConfig.chainApi = argv.chainapi
        = argv.chainapi || global._bistrot.testNetChainApi;
    return argv.testnet;
};

const magicPayment = async (url, options) => {
    if (options?.screening) { url = await mixin.maskPaymentUrl(url); }
    if (testNet()) {
        const [uuid, recipient, asset] = [
            uoid.uuidRegTxt, global._bistrot.testNetOfficialMixin,
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

export {
    chkCpVer,
    chkNwVer,
    magicPayment,
    requestChainApi,
    requestSushichef,
    testNet,
};
