'use strict';

const chainApiChina = ['https://prs-bp-cn1.xue.cn'];
const shareAttr = { p2p_port: 9876, rpc_port: 8888, rpc_https: false };
const chainConfig = () => { return global.chainConfig || {} };
const inChina = async (opt) => { return await getCeoCountry(opt) === 'CN'; };

let geo = null;

const chainApiGlobal = [
    'https://prs-bp1.press.one',
    'https://prs-bp2.press.one',
    'https://prs-bp3.press.one',
];

const defaultConfig = {
    accounts: null,
    chainApi: null,
    debug: false,
    keosApi: ['http://127.0.0.1:8900'],
    preserveIds: ['pressone', 'press.one', 'admin', 'administrator', 'root'],
    rpcApi: null,
    secret: false,
    speedTest: false,
};

const nodes = {
    pressonebp1: { ip: '5.135.106.40', geo: { country: 'FR' }, ...shareAttr },
    pressonebp2: { ip: '149.56.70.124', geo: { country: 'CA' }, ...shareAttr },
    // pressonebp3: { ip: '51.38.161.232', geo: { country: 'FR' }, ...shareAttr },
    pressonebp4: { ip: '178.32.224.137', geo: { country: 'FR' }, ...shareAttr },
    'prs-bp-cn1': { ip: '139.198.18.74', geo: { country: 'CN' }, ...shareAttr },
};

const getGeo = async () => {
    if (!geo) { try { geo = await shot.getCurrentPosition(); } catch (e) { } }
    return geo;
};

const getCeoCountry = async (opt) => {
    const geo = opt || await getGeo() || {};
    return geo.country_code || geo.country;
};

const get = async (options) => {
    options = options || {};
    const diff = options.config || chainConfig();
    const resp = utilitas.mergeAtoB(diff, Object.assign({}, defaultConfig));
    if (!options.authority && !diff.chainApi && await inChina(
    )) { resp.chainApi = chainApiChina; }
    if (options.authority || !resp.chainApi) { resp.chainApi = chainApiGlobal; }
    console.log(resp.rpcApi);
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
    resp.rpcApi = [...resp.rpcApi, ...(await inChina(
    ) && rpcChina.length ? rpcChina : rpcGlobal)];
    utilitas.assert(resp?.rpcApi?.length, 'RPC API endpoint not found.', 500);
    return resp;
};

module.exports = get;

const { utilitas, shot } = require('utilitas');
