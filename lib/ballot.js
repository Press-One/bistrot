'use strict';

const queryProducer = async (regexp) => {
    utilitas.assert(regexp, 'Regular expression is required.', 400);
    return await sushibar.requestApi(
        'GET', 'producers', { regexp }, null, 'Error querying producers.'
    );
};

module.exports = {
    queryProducer,
};

const { sushibar, utilitas } = require('sushitrain');
