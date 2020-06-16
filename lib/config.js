'use strict';

const { utilitas } = require('utilitas');

module.exports = utilitas.mergeAtoB(global.chainConfig, {

    debug: false,

    ipfsApi: 'http://127.0.0.1:5001',

    chainApi: [
        'https://prs-bp1.press.one',
        'https://prs-bp2.press.one',
        'https://prs-bp3.press.one',
        'https://prs-bp4.press.one',
    ],

});
