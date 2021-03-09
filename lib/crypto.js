'use strict';

const permissionLevels = ['active', 'owner'];

const leftpadZero = (dex) => {
    let hex = (+dex).toString(16).toUpperCase();
    if (hex.length % 2 > 0) { hex = '0' + hex; }
    return hex;
};

const sign = (string, privateKey) => {
    privateKey = utilitas.ensureString(privateKey);
    if (privateKey.length !== 64) { return ecc.signHash(string, privateKey); }
    const signature = ec.sign(string, privateKey, 'hex', { canonical: true });
    return signature.r.toString(16, 32)
        + signature.s.toString(16, 32)
        + leftpadZero(signature.recoveryParam.toString());
};

const signData = (data, privateKey) => {
    const [a, h] = [encryption.defaultAlgorithm, encryption.digestObject(data)];
    return { hash_algorithm: a, hash: h, signature: sign(h, privateKey) };
};

const recoverAddressBySignatureAndHash = (sig, msgHash) => {
    const msgB = utilitas.hexDecode(msgHash, true);
    const sigB = utilitas.hexDecode(sig.slice(0, 128), true);
    const senderPubKey = secp256k1.recover(msgB, sigB, Number(sig.slice(128)));
    const publickey = secp256k1.publicKeyConvert(senderPubKey, false).slice(1);
    return utilitas.hexEncode(ethereumUtil.pubToAddress(publickey), true);
};

// const recoverAddressBySignatureAndData = (sig, data) => {
//     return recoverAddressBySignatureAndHash(sig, encryption.digestObject(data));
// };

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

const verifySignatureLegacy = (signature, hash, userAddress) => {
    return userAddress === recoverAddressBySignatureAndHash(signature, hash);
};

module.exports = {
    sign,
    signData,
    verifySignature,
    verifySignatureOnChain,
    verifySignatureLegacy,
};

const { utilitas, encryption } = require('utilitas');
const ethereumUtil = require('ethereumjs-util');
const secp256k1 = require('secp256k1');
const elliptic = require('elliptic');
const account = require('./account');
const ecc = require('eosjs-ecc');
const ec = new elliptic.ec('secp256k1');
