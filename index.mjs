let mod;

try {
    mod = await import('./main.mjs');
    (process.argv || []).includes('--json') || console.log('>>> 🚧 Running in source mode.');
} catch (e) {
    if (/cannot find module.*main/i.test(e.message)) { mod = await import('./dist/index.mjs'); }
    else { console.log(e); }
}

export const {
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
    utilitas,
    web3,
    yargs,
} = mod;
