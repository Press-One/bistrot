'use strict';

const saveFields = [
    'id', 'user_address', 'type', 'meta', 'data', 'hash', 'signature'
];

const save = async (actor, privateKey, data, options = {}) => {
    utilitas.assert(data, 'Invalid block data.', 400);
    data.meta = utilitas.isObject(data.meta)
        ? JSON.stringify(data.meta) : data.meta;
    data.data = utilitas.isObject(data.data)
        ? JSON.stringify(data.data) : data.data;
    const args = { caller: actor };
    for (let field of saveFields) {
        utilitas.assert(!utilitas.isUndefined(
            data[field]
        ), `Invalid transaction field: ${field}.`, 400);
        args[field] = data[field];
    }
    return await sushitrain.transact(
        actor, privateKey, 'prs.prsc', 'save', args, options
    );
};

module.exports = {
    save,
};

const { utilitas } = require('utilitas');
const sushitrain = require('./sushitrain');
