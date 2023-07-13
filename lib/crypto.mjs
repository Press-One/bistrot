import { encryption, utilitas } from 'utilitas';
import elliptic from 'elliptic';
import ethUtil from 'ethereumjs-util';
import keythereum from 'keythereum-pure-js';
import secp256k1 from 'secp256k1';
import web3 from 'web3';

const ec = new (elliptic).ec('secp256k1');
//////////////////////////////// @todo: () ////////////////////////////////////
const keyParams = { keyBytes: 32, ivBytes: 16 };
const packKey = (buf, opts = {}) => opts.raw ? buf : utilitas.hexEncode(buf, 1);
const _assertAddress = (add, nm) => assertAddress(add, `Invalid ${nm}-address.`);
const assertOwner = address => _assertAddress(address, 'Owner');
const assertRecipient = address => _assertAddress(address, 'Recipient');
const assertSender = address => _assertAddress(address, 'Sender');
const assertAsset = address => _assertAddress(address, 'Asset');
const assertSpender = address => _assertAddress(address, 'Spender');

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
        address: packKey(ethUtil.pubToAddress(exP), options),
        publicKey: packKey(pubKey, options),
        privateKey: packKey(pK, options),
    };
};

const createKeystore = async (p, privateKey, op) => {
    assert(p = utilitas.ensureString(p), 'Password is required.', 400);
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

const verifySignature = (signature, hash, userAddress) =>
    userAddress === recoverAddressBySignatureAndHash(signature, hash);

const assertAddress = (address, error, code = 400) => {
    assert(web3.utils.isAddress(address), error || (
        address ? `Invalid address: ${address}.` : 'Address is required.'
    ), code);
    return address;
};

const privateKeyToAddress = (privateKey, options) => {
    const address = keythereum.privateKeyToAddress(privateKey);
    if (options?.strict) { return web3.utils.toChecksumAddress(address); }
    else if (options?.standard) { return address; }
    return address.slice(2);
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

const unifyAddress = (address) =>
    utilitas.ensureString(address).replace(/^0x/i, '').toUpperCase();

export {
    assertAddress,
    assertAsset,
    assertOwner,
    assertRecipient,
    assertSender,
    assertSpender,
    createKeys,
    createKeystore,
    privateKeyToAddress,
    recoverAddressBySignatureAndHash,
    recoverPrivateKey,
    sign,
    signData,
    unifyAddress,
    verifySignature,
};
