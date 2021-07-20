'use strict';

const getBalanceByAddress = async (address, opts) => {
    let resp = await (await quorum.getEthClient(null, opts)).getBalance(address);
    return opts?.asWei ? resp : web3.utils.fromWei(resp, opts?.unit || 'ether');
};

module.exports = {
    getBalanceByAddress,
};

const quorum = require('./quorum');
const web3 = require('web3');
