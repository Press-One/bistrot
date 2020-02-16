'use strict';

const { Keygen } = require('eosjs-keygen');
const keythereum = require('keythereum-pure-js');
const assert = require('assert');

const keyParams = { keyBytes: 32, ivBytes: 16 };

const dumpOptions = {
    kdf: 'pbkdf2',
    cipher: 'aes-128-ctr',
    kdfparams: {
        c: 262144,
        dklen: 32,
        prf: 'hmac-sha256',
    },
    noaddress: true,
};

const srtToBuf = (string) => {
    return Buffer.from(string);
};

const bufToStr = (buffer) => {
    return buffer.toString();
};

const createKeystore = async (password, publicKey, privateKey, options) => {
    assert(password, 'Password is require.');
    assert(!publicKey === !privateKey, 'PublicKey or PrivateKey is invalid.');
    if (!publicKey && !privateKey) {
        const keys = await Keygen.generateMasterKeys();
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

const recoverPrivateKey = (password, keystore, options) => {
    const privateKey = keythereum.recover(password, keystore);
    assert(keystore && keystore.publickey && privateKey, 'Invalid keystore.');
    return {
        privatekey: bufToStr(privateKey),
        publickey: keystore.publickey,
    };
};

module.exports = {
    createKeystore,
    recoverPrivateKey,
};
