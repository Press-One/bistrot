'use strict';

const chainApiGlobal = ['https://prs-bp2.press.one'];
const chainApiChina = ['https://prs-bp-cn1.xue.cn'];
const shareAtt = { p2p_port: 9876, rpc_port: 8888, rpc_https: false };
const chainConfig = () => { return global.chainConfig || {} };
const inChina = async (o) => { return (o || await getGeo())?.country === 'CN'; };

const defaultConfig = {
    accounts: null,
    chainApi: null,
    debug: false,
    rpcApi: null,
    secret: false,
    speedTest: false,
};

const nodes = {
    'quorum': { ip: '178.32.224.142', geo: { country: 'FR' }, ...shareAtt },
};

let geo = null;

const rawGetGeo = async (server) => {
    let resp;
    try {
        resp = await fetch(
            utilitas.assembleApiUrl(server, `api/system`)
        ).then(res => res.json());
    } catch (e) { }
    return resp?.data?.client?.geolocation;
};

const getGeo = async () => {
    return (geo = geo || await Promise.race(
        [...chainApiGlobal, ...chainApiChina].map(rawGetGeo)
    ));
};

const get = async (options) => {
    options = options || {};
    const diff = options.config || chainConfig();
    const resp = utilitas.mergeAtoB(diff, Object.assign({}, defaultConfig));
    if (!options.authority && !diff.chainApi && (await inChina() || options.safe)) {
        resp.chainApi = chainApiChina;
    }
    if (options.authority || !resp.chainApi) {
        resp.chainApi = chainApiGlobal;
    }
    resp.rpcApi = utilitas.ensureArray(resp.rpcApi);
    const [rpcChina, rpcGlobal] = [[], []];
    for (let i in nodes) {
        if (nodes[i].rpc_port && !chainConfig().rpcApi) {
            const http = `http${nodes[i].rpc_https ? 's' : ''}`;
            (await inChina(nodes[i].geo) ? rpcChina : rpcGlobal).push(
                `${http}://${nodes[i].ip}:${nodes[i].rpc_port}`
            );
        }
    }
    resp.rpcApi = [...resp.rpcApi, ...(
        await inChina() && rpcChina.length ? rpcChina : rpcGlobal
    )];
    utilitas.assert(resp?.rpcApi?.length, 'RPC API endpoint not found.', 500);
    return resp;
};

module.exports = get;

const { utilitas, fetch } = require('utilitas');
