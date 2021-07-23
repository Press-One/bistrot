'use strict';

const abiName = 'RumAccount';

const pkRules = {
    user: {}, payment_provider: {}, payment_account: {},
    meta: { json: true }, memo: {}
};

const getBalanceByAddress = async (address, opts) => {
    let resp = await (await quorum.getEthClient(null, opts)).getBalance(address);
    return opts?.asWei ? resp : web3.utils.fromWei(resp, opts?.unit || 'ether');
};

const unpackTransaction = async (data) => {
    quorum.assertObject(data, 'Invalid transaction data.');
    const r = {};
    for (let f in pkRules) {
        const k = pkRules[f]?.key || f;
        r[f] = data[k];
        if (pkRules[f]?.json) { try { r[k] = JSON.parse(r[k]); } catch (e) { } }
    }
    return r;
};

const bind = async (privateKey, user, provider, id, meta, memo, options) => {
    if (utilitas.isString(user) && !user.startsWith('0x')) {
        user = `0x${user.toLowerCase()}`;
    }
    quorum.assertAddress(user);
    utilitas.assert(provider, 'Identity-provider is required.', 400);
    utilitas.assert(id, 'Identity-id is required.', 400);
    meta = Object.assign({ request: { type: provider } }, meta || {});
    meta.request.type = utilitas.ensureString(meta.request.type, { case: 'UP' });
    return await quorum.sendToPreparedContractMethod(
        privateKey, abiName, 'bind',
        [user, provider, id, JSON.stringify(meta), utilitas.ensureString(memo)],
        options
    );
};

module.exports = {
    bind,
    getBalanceByAddress,
    unpackTransaction,
};

const { utilitas } = require('utilitas');
const quorum = require('./quorum');
const web3 = require('web3');
