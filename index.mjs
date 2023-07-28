// dependencies
import * as elliptic from 'elliptic';
import * as ethereumUtil from 'ethereumjs-util';
import * as hdwalletProvider from '@truffle/hdwallet-provider';
import * as keythereum from 'keythereum-pure-js';
import * as secp256k1 from 'secp256k1';
import * as solc from 'solc';
import * as table from 'table';
import * as utilitas from 'utilitas';
import web3 from 'web3';
// features
import * as account from './lib/account.mjs';
import * as blockScout from './lib/blockScout.mjs';
import * as crypto from './lib/crypto.mjs';
import * as erc20 from './lib/erc20.mjs';
import * as erc721 from './lib/erc721.mjs';
import * as etc from './lib/etc.mjs';
import * as finance from './lib/finance.mjs';
import * as mixin from './lib/mixin.mjs';
import * as paidGroup from './lib/paidGroup.mjs';
import * as quorum from './lib/quorum.mjs';
import * as rumsc from './lib/rumsc.mjs';
import * as sushibar from './lib/sushibar.mjs';
import * as system from './lib/system.mjs';
import * as yonJigen from './lib/yonJigen.mjs';
import config from './lib/config.mjs';
import manifest from './lib/manifest.mjs';
import PACMAN from './lib/pacman.mjs';

const pacman = new PACMAN();
const pacmvm = new PACMAN({ mvm: true });

export * from 'utilitas';
export {
    account, blockScout, config, crypto, elliptic, erc20, erc721, etc,
    ethereumUtil, finance, hdwalletProvider, keythereum, manifest, mixin,
    pacman, pacmvm, paidGroup, quorum, rumsc, secp256k1, solc, sushibar, system,
    table, web3, yonJigen,
};

globalThis._bistrot = {
    testNetRpcApi: 'http://51.255.133.170:8888',           // nolonger available
    testNetChainApi: 'https://elm-sushibar.ngrok.io',      // nolonger available
    testNetOfficialMixin: '14da6c0c-0cbf-483c-987a-c44477dcad1b', // https://developers.mixin.one/apps/7000102337
};

if (utilitas.utilitas.inBrowser() && !globalThis.bistrot) {
    globalThis.bistrot = {
        ...utilitas, account, blockScout, config, crypto, elliptic, erc20,
        erc721, etc, ethereumUtil, finance, hdwalletProvider, keythereum,
        manifest, mixin, pacman, paidGroup, quorum, rumsc, secp256k1, solc,
        sushibar, system, table, web3, yonJigen,
    };
    utilitas.utilitas.log(
        `(${manifest.homepage}) is ready!`,
        `${(await utilitas.utilitas.which(manifest)).title}.*`
    );
}
