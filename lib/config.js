'use strict';

const defaultNodesExpiration = 1000 * 60 * 10;
const toInt = (any) => { return parseInt(any || 0); }

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

    // getNodesFromDatabase: false,
    getNodesFromDatabase: true,

    nodesExpiration: defaultNodesExpiration,

    nodes: null,

    accounts: null,

    database: null,

    rpcApi: null,

    shpApi: null,

};

const getNodes = async (config) => {
    const now = Date.now();
    if (!config.nodes || !config.nodes.length
        || (toInt(lastNodesUpdated) + toInt(config.nodesExpiration) < now)) {
        if (config.getNodesFromDatabase) {
            config.nodes = await node.queryAll();
        } else {
            console.log('GET FROM HTTP');
        }
        lastNodesUpdated = now;
        console.log('LOADED');
    } else {
        console.log('OK');
    }
    node.assertNodes(config.nodes);
    Object.assign(config, { rpcApi: [], shpApi: [] });
    for (let item of config.nodes) {
        if (item.status !== 'NORMAL') { continue; }
        if (item.rpc_port) {
            const http = `http${item.rpc_https ? 's' : ''}`;
            config.rpcApi.push(`${http}://${item.ip}:${item.rpc_port}`);
        }
        if (item.shp_port) {
            config.shpApi.push(`ws://${item.ip}:${item.shp_port}`);
        }
    }
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
const node = require('./node');
