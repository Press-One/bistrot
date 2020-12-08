'use strict';

const defaultNodesExpiration = 1000 * 60 * 10;
const chainApiGlobal = [
    'https://prs-bp1.press.one',
    'https://prs-bp2.press.one',
    'https://prs-bp3.press.one',
];
const chainApiChina = [
    'https://prs-bp-cn1.xue.cn'
];

let [geo, lastNodesUpdated] = [null, null];

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

    nodesExpiration: defaultNodesExpiration,

    nodes: null,

    accounts: null,

    database: null,

    rpcApi: null,

    shpApi: null,

    chainApi: null,

};

const getNodes = async (config) => {
    const now = Date.now();
    if ((!global.chainConfig.rpcApi || !global.chainConfig.shpApi)
        && (!config.nodes || !config.nodes.length || (
            utilitas.ensureInt(lastNodesUpdated)
            + utilitas.ensureInt(config.nodesExpiration) < now))) {
        node.assertNodes(config.nodes = await (config.getNodesFromDatabase
            ? node.queryAll : sushibar.getNodes)());
        lastNodesUpdated = now;
    }
    config.rpcApi = utilitas.ensureArray(config.rpcApi);
    config.shpApi = utilitas.ensureArray(config.shpApi);
    for (let item of config.nodes || []) {
        if (item.status !== 'NORMAL') { continue; }
        if (item.rpc_port && !global.chainConfig.rpcApi) {
            const http = `http${item.rpc_https ? 's' : ''}`;
            config.rpcApi.push(`${http}://${item.ip}:${item.rpc_port}`);
        }
        if (item.shp_port && !global.chainConfig.shpApi) {
            config.shpApi.push(`ws://${item.ip}:${item.shp_port}`);
        }
    }
    utilitas.assert(config.rpcApi && config.rpcApi.length,
        'RPC API endpoint not found.', 500);
    utilitas.assert(config.shpApi && config.shpApi.length,
        'State-History-Plugin API endpoint not found.', 500);
    return config;
};

const get = async (options) => {
    options = options || {};
    const diff = options.config || global.chainConfig || {};
    const resp = utilitas.mergeAtoB(diff, defaultConfig);
    if (!options.authority && !diff.chainApi) {
        geo = geo || (await network.getCurrentPosition()) || {};
        if (geo.country === 'CN') { resp.chainApi = chainApiChina; }
    }
    if (options.authority || !resp.chainApi) { resp.chainApi = chainApiGlobal; }
    if (!options.basicConfigOnly) { await getNodes(resp); }
    return resp;
};

module.exports = get;

const { utilitas, network } = require('utilitas');
const sushibar = require('./sushibar');
const node = require('./node');
