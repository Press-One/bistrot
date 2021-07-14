'use strict';

const keyParams = { keyBytes: 32, ivBytes: 16 };
const packKey = (b, o = {}) => { return o.raw ? b : utilitas.hexEncode(b, 1); };

const dumpOptions = {
    kdf: 'pbkdf2', cipher: 'aes-128-ctr', noaddress: false,
    kdfparams: { c: 262144, dklen: 32, prf: 'hmac-sha256' },
};

const leftpadZero = (dex) => {
    let hex = (+dex).toString(16).toUpperCase();
    if (hex.length % 2 > 0) { hex = '0' + hex; }
    return hex;
};

const createKeys = (options) => {
    let pK;
    do { pK = encryption.random(32); } while (!secp256k1.privateKeyVerify(pK));
    const pubKey = Buffer.from(secp256k1.publicKeyCreate(pK));
    const exP = Buffer.from(secp256k1.publicKeyConvert(pubKey, false).slice(1));
    return {
        address: packKey(ethereumUtil.pubToAddress(exP), options),
        publicKey: packKey(pubKey, options),
        privateKey: packKey(pK, options),
    };
};

const createKeystore = async (p, privateKey, op) => {
    utilitas.assert(p = utilitas.ensureString(p), 'Password is required.', 400);
    privateKey = utilitas.ensureString(privateKey) || createKeys(op).privateKey;
    const dk = keythereum.create(keyParams);
    return keythereum.dump(
        p, utilitas.hexDecode(privateKey, true), dk.salt, dk.iv, dumpOptions
    );
};

const sign = (string, privateKey) => {
    privateKey = utilitas.ensureString(privateKey);
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
    const mB = utilitas.hexDecode(msgHash, true);
    const sB = utilitas.hexDecode(sig.slice(0, 128), true);
    const ecdsaPubKey = secp256k1.ecdsaRecover(sB, Number(sig.slice(128)), mB);
    const pubKey = secp256k1.publicKeyConvert(ecdsaPubKey, false).slice(1);
    return utilitas.hexEncode(ethUtil.pubToAddress(Buffer.from(pubKey)), true);
};

const verifySignature = (signature, hash, userAddress) => {
    return userAddress === recoverAddressBySignatureAndHash(signature, hash);
};

const privateKeyToAddress = (privateKey) => {
    return keythereum.privateKeyToAddress(privateKey).slice(2);
};

const recoverPrivateKey = (password, keystore, option) => {
    option = option || {};
    password = utilitas.ensureString(password);
    const privateKey = keythereum.recover(password, keystore);
    return {
        address: privateKeyToAddress(privateKey),
        privateKey: utilitas.hexEncode(privateKey, true),
    };
};

module.exports = {
    createKeys,
    createKeystore,
    privateKeyToAddress,
    recoverPrivateKey,
    sign,
    signData,
    verifySignature,
};

const { utilitas, encryption } = require('utilitas');
const ethereumUtil = require('ethereumjs-util');
const keythereum = require('keythereum-pure-js');
const secp256k1 = require('secp256k1');
const ethUtil = require('ethereumjs-util');
const ec = new (require('elliptic')).ec('secp256k1');
