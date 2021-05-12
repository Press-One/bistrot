'use strict';

const queryAll = async () => {
    return await sushibar.requestApi('GET', 'nodes');
};

module.exports = {
    queryAll,
};

const { sushibar } = require('sushitrain');
