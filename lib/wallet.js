'use strict';

const keyParams = { keyBytes: 32, ivBytes: 16 };
const srtToBuf = (string) => { return Buffer.from(string); };
const bufToStr = (buffer, opt = undefined) => { return buffer.toString(opt); };
const packKey = (b, o = {}) => { return o.raw ? b : utilitas.hexEncode(b, 1); };

const dumpOptions = {
    kdf: 'pbkdf2',
    cipher: 'aes-128-ctr',
    kdfparams: { c: 262144, dklen: 32, prf: 'hmac-sha256' },
    noaddress: true,
};

const createKeystore = async (password, publicKey, privateKey, options) => {
    password = utilitas.ensureString(password);
    publicKey = utilitas.ensureString(publicKey);
    privateKey = utilitas.ensureString(privateKey);
    utilitas.assert(password, 'Password is require.', 400);
    utilitas.assert(!publicKey === !privateKey,
        'PublicKey or PrivateKey is invalid.', 400);
    if (!publicKey && !privateKey) {
        const keys = await account.generateKeystore();
        publicKey = keys.publicKeys.active;
        privateKey = keys.privateKeys.active;
    }
    const dk = keythereum.create(keyParams);
    const keyObject = keythereum.dump(
        password, srtToBuf(privateKey), dk.salt, dk.iv, dumpOptions
    );
    keyObject.publickey = publicKey;
    delete keyObject.address;
    return keyObject;
};

const createLegacyKeys = (options) => {
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

const recoverPrivateKey = (password, keystore, option) => {
    option = option || {};
    password = utilitas.ensureString(password);
    const privateKey = keythereum.recover(password, keystore);
    utilitas.assert(option.legacy || (keystore
        && keystore.publickey && privateKey), 'Invalid keystore.', 400);
    return option.legacy ? {
        privatekey: utilitas.hexEncode(privateKey, true),
        address: crypto.privateKeyToAddress(privateKey),
    } : {
        privatekey: bufToStr(privateKey),
        publickey: keystore.publickey,
    };
};

module.exports = {
    createKeystore,
    createLegacyKeys,
    recoverPrivateKey,
};

const {
    utilitas, account, crypto, keythereum, ethereumUtil, secp256k1, encryption
} = require('sushitrain');
