'use strict';

const { utilitas } = require('sushitrain');

module.exports = utilitas.mergeAtoB(global.chainConfig, {

    debug: false,

    secret: false,

    speedTest: false,

    ipfsApi: 'http://127.0.0.1:5001',

    chainApi: [
        'https://prs-gns.press.one',
        'https://prs-bp1.press.one',
        'https://prs-bp2.press.one',
    ],

});
