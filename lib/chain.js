'use strict';

const { prsc } = require('sushitrain');

const accountEvolution = async (
    userAddress, previousPrivateKey, account, publicKey, privateKey
) => {
    const resp = await prsc.signSave('EVOLUTION:1', null, {
        from: userAddress,
        to: publicKey,
        field: 'user_address',
    }, account, publicKey, privateKey, {
        userAddress, privateKey: previousPrivateKey, legacySignature: true
    });
    return resp;
};

module.exports = {
    accountEvolution,
};
