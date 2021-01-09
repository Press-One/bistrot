'use strict';

const { utilitas, account, keythereum } = require('sushitrain');

const keyParams = { keyBytes: 32, ivBytes: 16 };

const dumpOptions = {
    kdf: 'pbkdf2',
    cipher: 'aes-128-ctr',
    kdfparams: { c: 262144, dklen: 32, prf: 'hmac-sha256' },
    noaddress: true,
};

const srtToBuf = (string) => {
    return Buffer.from(string);
};

const bufToStr = (buffer) => {
    return buffer.toString();
};

const createKeystore = async (
    password, publicKey, privateKey, options = {}
) => {
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

const recoverPrivateKey = (password, keystore, options = {}) => {
    password = utilitas.ensureString(password);
    const privateKey = keythereum.recover(password, keystore);
    utilitas.assert(keystore
        && keystore.publickey && privateKey, 'Invalid keystore.', 400);
    return { privatekey: bufToStr(privateKey), publickey: keystore.publickey };
};

module.exports = {
    createKeystore,
    recoverPrivateKey,
};
