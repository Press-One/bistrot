'use strict';

const solName = 'RumERC20';
const defaultCap = '21000000000000000000000000';

const deploy = async (symbol, privateKey, options) => {
    utilitas.assert((
        symbol = utilitas.ensureString(symbol, { case: 'UP' })
    ), 'Symbol is required', 400);
    utilitas.assert((
        privateKey = utilitas.ensureString(privateKey)
    ), 'Private-key is required', 400);
    const args = [
        utilitas.ensureString(options?.name) || `${symbol} Token`, symbol,
        web3.utils.toBN(utilitas.ensureString(options?.cap) || defaultCap),
        utilitas.ensureString(options?.miner) || crypto.privateKeyToAddress(
            privateKey, { ...options || {}, standard: true }
        ),
    ];
    return await quorum.deployPreparedContract(
        solName, args, { ...options || {}, privateKey }
    );
};

module.exports = {
    deploy,
};

const { utilitas } = require('utilitas');
const quorum = require('./quorum');
const crypto = require('./crypto');
const web3 = require('web3');
