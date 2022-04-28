const manifest = {
    "name": "bistrot",
    "description": "A CLI client and also an API library for RumSystem.net.",
    "version": "7.4.80",
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
        "@truffle/hdwallet-provider": "^2.0.7",
        "abi-decoder": "^2.4.0",
        "elliptic": "^6.5.4",
        "ethereumjs-util": "^7.1.4",
        "keythereum-pure-js": "^1.1.9",
        "readline-sync": "^1.4.10",
        "secp256k1": "^4.0.3",
        "solc": "^0.8.13",
        "table": "^6.8.0",
        "utilitas": "^1990.1.36",
        "web3": "^1.7.3",
        "yargs": "^17.4.1"
    }
};

export default manifest;