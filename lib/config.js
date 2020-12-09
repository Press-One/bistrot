'use strict';

const nodesExpiration = 1000 * 60 * 10;
const chainApiGlobal = [
    'https://prs-bp1.press.one',
    'https://prs-bp2.press.one',
    'https://prs-bp3.press.one',
];
const chainApiChina = [
    'https://prs-bp-cn1.xue.cn'
];

let [nodes, geo, lastNodesUpdated] = [[], null, null];

const defaultConfig = {

    debug: false,

    secret: false,

    speedTest: false,

    serviceStateHistoryPlugin: false,

    serviceTransactionArchive: false,

    serviceDefiPricesSubmit: false,

    serviceDefiPricesWatch: false,

    serviceDefiPricesArchive: false,

    keosApi: [
        'http://127.0.0.1:8900',
    ],

    preserveIds: [
        'pressone',
        'press.one',
        'admin',
        'administrator',
        'root',
    ],

    getNodesFromDatabase: false,

    accounts: null,

    database: null,

    rpcApi: null,

    shpApi: null,

    chainApi: null,

};

const getGeo = async () => {
    return geo = geo || await network.getCurrentPosition();
};

const getCeoCountry = async (optGeo) => {
    return (optGeo || await getGeo() || {}).country;
};

const inChina = async (optGeo) => {
    return await getCeoCountry(optGeo) === 'CN';
};

const geoId = async () => {
    for (let item of nodes || {
    }) { if (!item.geo) { item.geo = await geoIp.lookup(item.ip); } }
};

const getNodes = async (config) => {
    const now = Date.now();
    if ((!global.chainConfig.rpcApi || !global.chainConfig.shpApi)
        && (!nodes || !nodes.length || (
            utilitas.ensureInt(lastNodesUpdated)
            + utilitas.ensureInt(nodesExpiration) < now))) {
        node.assertNodes(nodes = await (config.getNodesFromDatabase
            ? node.queryAll : sushibar.getNodes)());
        lastNodesUpdated = now;
    }
    await geoId(config);
    config.rpcApi = utilitas.ensureArray(config.rpcApi);
    config.shpApi = utilitas.ensureArray(config.shpApi);
    const [rpcChina, rpcGlobal, shpChina, shpGlobal] = [[], [], [], []];
    for (let item of nodes || []) {
        if (item.status !== 'NORMAL') { continue; }
        if (item.rpc_port && !global.chainConfig.rpcApi) {
            const http = `http${item.rpc_https ? 's' : ''}`;
            (await inChina(item.geo) ? rpcChina : rpcGlobal).push(
                `${http}://${item.ip}:${item.rpc_port}`
            );
        }
        if (item.shp_port && !global.chainConfig.shpApi) {
            (await inChina(item.geo) ? shpChina : shpGlobal).push(
                `ws://${item.ip}:${item.shp_port}`
            );
        }
    }
    config.rpcApi = [...config.rpcApi, ...(await inChina(
    ) && rpcChina.length ? rpcChina : rpcGlobal)];
    config.shpApi = [...config.shpApi, ...(await inChina(
    ) && shpChina.length ? shpChina : shpGlobal)];
    utilitas.assert(config.rpcApi && config.rpcApi.length,
        'RPC API endpoint not found.', 500);
    utilitas.assert(config.shpApi && config.shpApi.length,
        'State-History-Plugin API endpoint not found.', 500);
    return config;
};

const get = async (options) => {
    options = options || {};
    const diff = options.config || global.chainConfig || {};
    const resp = utilitas.mergeAtoB(diff, Object.assign({}, defaultConfig));
    if (!options.authority && !diff.chainApi && await inChina(
    )) { resp.chainApi = chainApiChina; }
    if (options.authority || !resp.chainApi) { resp.chainApi = chainApiGlobal; }
    if (!options.basicConfigOnly) { await getNodes(resp); }
    return resp;
};

module.exports = get;

const { utilitas, network, geoIp } = require('utilitas');
const sushibar = require('./sushibar');
const node = require('./node');
