const manifest = {
    "name": "bistrot",
    "description": "A CLI client and also an API library for RumSystem.net.",
    "version": "7.6.5",
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
        "@truffle/hdwallet-provider": "^2.1.12",
        "abi-decoder": "github:Leask/abi-decoder",
        "elliptic": "^6.5.4",
        "ethereumjs-util": "^7.1.5",
        "keythereum-pure-js": "^1.1.9",
        "secp256k1": "^5.0.0",
        "solc": "0.8.20",
        "table": "^6.8.1",
        "utilitas": "^1995.0.7",
        "web3": "^4.0.3"
    }
};

export default manifest;