'use strict';

const assertNodes = (nodes, message, status) => {
    message = message || 'Error quering global network configuration.';
    status = status || 500;
    return utilitas.assert(nodes && nodes.length, message, status);
};

const queryAll = async () => {
    const resp = await database.query('SELECT * FROM nodes');
    assertNodes(resp && resp.rows);
    return resp.rows;
};

module.exports = {
    assertNodes,
    queryAll,
};

const { utilitas } = require('utilitas');
const database = require('./database');
