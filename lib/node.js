'use strict';

const assertNodes = (nodes, message, status) => {
    message = message || 'Error quering global network configuration.';
    status = status || 500;
    return utilitas.assert(nodes && nodes.length, message, status);
};

const queryDatabase = async () => {
    const resp = await database.query('SELECT * FROM nodes');
    assertNodes(resp && resp.rows);
    for (let x of resp.rows) { x.geo = await geoIp.lookup(x.ip); }
    return resp.rows;
};

const queryAuthority = async () => {
    return await sushibar.requestApi('GET', 'nodes');
};

const queryAll = async (c) => {
    c = c || await config({ basicConfigOnly: true });
    const n = await (c.getNodesFromDatabase ? queryDatabase : queryAuthority)();
    assertNodes(n);
    return n;
};

module.exports = {
    queryDatabase,
    queryAuthority,
    queryAll,
};

const { utilitas, geoIp } = require('utilitas');
const database = require('./database');
const sushibar = require('./sushibar');
const config = require('./config');
