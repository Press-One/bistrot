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

const testNet = (argv) => {
    const tnetAdd = 'http://51.255.133.170:8888';
    const tchnAdd = 'https://elm-sushibar.ngrok.io';
    if (argv.testnet && (
        !utilitas.insensitiveCompare(argv.rpcapi, tnetAdd)
        || !utilitas.insensitiveCompare(argv.chainapi, tchnAdd)
    )) {
        utilitas.fullLengthLog('RUNNING ON TESTING NETWORK!');
        argv.rpcapi = tnetAdd; argv.chainapi = tchnAdd;
    }
    return argv.testnet;
};

const magicPayment = (url, options) => {
    if (!global.chainConfig || !global.chainConfig.testNet) { return url; }
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
    return url;
};

module.exports = {
    chkCpVer,
    chkNwVer,
    requestChainApi,
    testNet,
    magicPayment,
};
