import * as utilitas from 'utilitas';

let runningInBrowser = false;
try { runningInBrowser = !!window; } catch (e) { }

// import * as package from './package.json';
// https://www.stefanjudis.com/snippets/how-to-import-json-files-in-es-modules-node-js/
const pack = {
    ...await utilitas.storage.readJson('./package.json'),
    // testNetRpcApi: 'http://51.255.133.170:8888',
    // testNetChainApi: 'https://elm-sushibar.ngrok.io',
    testNetOfficialMixin: '14da6c0c-0cbf-483c-987a-c44477dcad1b',
    runningInBrowser,
};

// dependencies
import * as abiDecoder from 'abi-decoder';
import * as elliptic from 'elliptic';
import * as ethereumUtil from 'ethereumjs-util';
import * as hdwalletProvider from '@truffle/hdwallet-provider';
import * as keythereum from 'keythereum-pure-js';
import * as readlineSync from 'readline-sync';
import * as secp256k1 from 'secp256k1';
import * as solc from 'solc';
import * as table from 'table';
import * as web3 from 'web3';
import * as yargs from 'yargs';
// features
import * as account from './lib/account.mjs';
import * as crypto from './lib/crypto.mjs';
import * as erc20 from './lib/erc20.mjs';
import * as etc from './lib/etc.mjs';
import * as finance from './lib/finance.mjs';
import * as keychain from './lib/keychain.mjs';
import * as mixin from './lib/mixin.mjs';
import * as pacman from './lib/pacman.mjs';
import * as quorum from './lib/quorum.mjs';
import * as rumsc from './lib/rumsc.mjs';
import * as sushibar from './lib/sushibar.mjs';
import * as system from './lib/system.mjs';
import config from './lib/config.mjs';
import preference from './lib/preference.mjs';

if (runningInBrowser) {
    window._bistrot = pack;
    window.bistrot = {
        ...utilitas,
        abiDecoder,
        account,
        config,
        crypto,
        elliptic,
        erc20,
        etc,
        ethereumUtil,
        finance,
        hdwalletProvider,
        keychain,
        keythereum,
        mixin,
        pacman,
        preference,
        quorum,
        readlineSync,
        rumsc,
        secp256k1,
        solc,
        sushibar,
        system,
        table,
        web3,
        yargs,
    };
    console.log('[BISTROT](https://github.com/Press-One/bistrot) is ready!');
} else { global._bistrot = pack; }

export * from 'utilitas';
export {
    abiDecoder,
    account,
    config,
    crypto,
    elliptic,
    erc20,
    etc,
    ethereumUtil,
    finance,
    hdwalletProvider,
    keychain,
    keythereum,
    mixin,
    pacman,
    preference,
    quorum,
    readlineSync,
    rumsc,
    secp256k1,
    solc,
    sushibar,
    system,
    table,
    web3,
    yargs,
};
