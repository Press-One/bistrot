import { assetIds, maskPaymentUrl } from './mixin.mjs';
import { requestApi } from './sushibar.mjs';
import { shot, uoid, utilitas } from 'utilitas';
import config from './config.mjs';

const chkCpVer = async () => await requestChainApi('GET', 'system');
const chkNwVer = async () => await shot.getVersionOnNpm('bistrot');

const requestChainApi = async (method, path, urlArgs, body, error, ot) => {
    ot = ot || {};
    ot.headers = ot.headers || {};
    // ot.headers['User-Agent'] = 'bistrot/7.0.0'; // keep this line for debug
    ot.headers['User-Agent'] = (await utilitas.which(globalThis._bistrot)).userAgent;
    return await requestApi(method, path, urlArgs, body, error, ot);
};

const requestSushichef = async (method, path, urlArgs, body, error, option) => {
    option = option || {};
    option.api = testNet()
        ? globalThis._bistrot.testNetChainApi
        : utilitas.getItemFromStringOrArray((await config(
            { basicConfigOnly: true, authority: true, config: {} }
        )).chainApi);
    return await requestChainApi(method, path, urlArgs, body, error, option);
};

const isTestRpcApi = (url) =>
    utilitas.insensitiveCompare(url, globalThis._bistrot.testNetRpcApi);

const isTestChainApi = (url) =>
    utilitas.insensitiveCompare(url, globalThis._bistrot.testNetChainApi)

const testNet = (argv = {}) => {
    globalThis.chainConfig = globalThis.chainConfig || {};
    argv.testnet = argv.testnet
        || isTestRpcApi(argv.rpcapi)
        || isTestChainApi(argv.chainapi)
        || isTestRpcApi(globalThis.chainConfig.rpcApi)
        || isTestChainApi(globalThis.chainConfig.chainApi);
    if (!argv.testnet) { return argv.testnet; }
    if (!argv.json && !globalThis._bistrot.loggedTest) {
        console.log('>>> 🌍 Running on testing network.');
    }
    globalThis._bistrot.loggedTest = true;
    globalThis.chainConfig.rpcApi = argv.rpcapi
        = argv.rpcapi || globalThis._bistrot.testNetRpcApi;
    globalThis.chainConfig.chainApi = argv.chainapi
        = argv.chainapi || globalThis._bistrot.testNetChainApi;
    return argv.testnet;
};

const magicPayment = async (url, options) => {
    if (options?.screening) { url = await maskPaymentUrl(url); }
    if (testNet()) {
        const [uuid, recipient, asset] = [
            uoid.uuidRegTxt, globalThis._bistrot.testNetOfficialMixin,
            assetIds.CNB.id,
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
