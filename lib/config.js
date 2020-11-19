'use strict';

const defaultNodesExpiration = 1000 * 60 * 10;

let lastNodesUpdated = null;

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

    chainApi: [
        'https://prs-bp1.press.one',
        'https://prs-bp2.press.one',
        'https://prs-bp3.press.one',
    ],

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
    const resp = utilitas.mergeAtoB(options.config
        || global.chainConfig, defaultConfig);
    if (!options.basicConfigOnly) { await getNodes(resp); }
    return resp;
};

module.exports = get;

const { utilitas } = require('utilitas');
const sushibar = require('./sushibar');
const node = require('./node');
