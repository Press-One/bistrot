'use strict';

const chainApiGlobal = ['https://prs-bp2.press.one'];
const chainApiChina = chainApiGlobal; // 'https://prs-bp-cn1.xue.cn'
const shareAtt = { p2p_port: 30303, rpc_port: 8545, rpc_https: false };
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
    // 'quorum_eos': { ip: '178.32.224.142', geo: { country: 'FR' }, ...shareAtt },
    'quorum': {
        ip: '149.56.22.113', geo: { country: 'CA' }, ...shareAtt,
        id: '59cc1c7b3e54e360e1906e3ba8276fbd7bd2a390e5f71238af316259172644729'
            + '22da8137d70b25edf88bc1df57836c026bf1053a1f0238f59c5dfbc5ad2e0f0',
    },
    // 'quorum': { ip: '127.0.0.1', geo: { country: 'CA' }, ...shareAtt },
};

for (let i in nodes) {
    nodes[i].uri = `enode://${nodes[i].id}@${nodes[i].ip}:${nodes[i].p2p_port}`;
}

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
    const resp = utilitas.mergeAtoB(diff, Object.assign({ nodes }, defaultConfig));
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
