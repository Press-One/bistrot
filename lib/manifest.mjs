const manifest = {
    "name": "bistrot",
    "description": "A CLI client and also an API library for RumSystem.net.",
    "version": "7.5.54",
    "private": false,
    "homepage": "https://github.com/Press-One/bistrot",
    "main": "index.mjs",
    "test": "test.mjs",
    "type": "module",
    "bin": {
        "bistrot": "bin/bistrot.mjs"
    },
    "engines": {
        "node": ">=18.x"
    },
    "author": "Leask Wong <i@leaskh.com>",
    "license": "MIT",
    "repository": {
        "type": "git",
        "url": "https://github.com/Press-One/bistrot.git"
    },
    "dependencies": {
        "@truffle/hdwallet-provider": "^2.1.5",
        "abi-decoder": "github:Leask/abi-decoder",
        "create-torrent": "^6.0.6",
        "elliptic": "^6.5.4",
        "ethereumjs-util": "^7.1.5",
        "keythereum-pure-js": "^1.1.9",
        "parse-torrent": "^11.0.5",
        "secp256k1": "^5.0.0",
        "solc": "0.8.17",
        "table": "^6.8.1",
        "utilitas": "^1991.1.6",
        "web3": "^1.8.2",
        "yargs": "^17.6.2"
    }
};

export default manifest;