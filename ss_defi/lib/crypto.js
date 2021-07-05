'use strict';

const permissionLevels = ['active', 'owner'];

const signData = (data, privateKey) => {
    const hash = prsUtility.hashBlockData(data);
    return { hash, signature: ecc.signHash(hash, privateKey) };
};

const verifySignature = (signature, hash, pubkey) => {
    return ecc.verifyHash(signature, hash, pubkey);
};

const verifySignatureOnChain = async (signature, hash, acc, options) => {
    options = options || {};
    options.permission = utilitas.ensureString(
        options.permission, { case: 'LOW' }
    ) || permissionLevels[0];
    const pmsLevel = permissionLevels.indexOf(options.permission);
    utilitas.assert(pmsLevel >= 0, 'Invalid permission.', 400);
    const keys = await account.getKeys(acc);
    const result = [];
    for (let item of keys) {
        const level = permissionLevels.indexOf(item.permission);
        if (level >= pmsLevel && verifySignature(signature, hash, item.key)) {
            result.push(item);
        }
    }
    return result.length ? result : null;
};

module.exports = {
    signData,
    verifySignature,
    verifySignatureOnChain,
};

const { utilitas } = require('utilitas');
const prsUtility = require('prs-utility');
const account = require('./account');
const ecc = require('eosjs-ecc');
