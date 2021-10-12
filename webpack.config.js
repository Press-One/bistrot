'use strict';

const webpack = require('webpack');
const path = require('path');

const base = {

    mode: 'production',

    entry: './main.js',

    // optimization: { minimize: true },
    optimization: { minimize: false },

    resolve: {
        extensions: ['.js', '.json', '.node'],
        alias: {
            '@sentry/node': false,
            'fast-geoip': false,
            'ioredis': false,
            'mailgun-js': false,
            'mysql2/promise': false,
            'node-mailjet': false,
            'public-ip': false,
            'telesignsdk': false,
            'twilio': false,
            'winston-papertrail-mproved': false,
            'winston': false,
            'LevelDatastore': false, // @todo by @LeaskH: Disabled for now
        },
    },

    externals: [
        /cardinal/, // mysql
        { got: 'commonjs got' }, // public-ip
    ],

    ignoreWarnings: [warning => {
        return ((warning?.loc?.start?.line === 84 // utilitas.event
            && warning?.loc?.start?.column === 20
            && warning?.loc?.end?.line === 84
            && warning?.loc?.end?.column === 52));
    }],

    node: {
        __dirname: false,
        __filename: false,
    },

};

module.exports = [{
    ...base, ...{
        target: ['node14', 'electron14-main'],
        output: {
            libraryTarget: 'commonjs',
            path: path.resolve(__dirname, 'dist'),
            filename: 'index.js',
        },
    },
}, {
    ...base, ...{
        target: ['web'],
        output: {
            path: path.resolve(__dirname, 'dist'),
            filename: 'index.web.js',
        },
        plugins: [
            new webpack.ProvidePlugin({
                process: 'process/browser.js',
                Buffer: ['buffer', 'Buffer'],
            }),
        ],
        resolve: {
            ...base.resolve,
            alias: {
                ...base.resolve.alias,
                './generated-prefix-list.json': false,
                'fake-indexeddb': false,
                'libp2p-kad-dht': false,
                'libp2p-mdns': false,
                'libp2p-tcp': false,
                child_process: false,
                dgram: false,
                module: false,
                ping: false,
                solc: false,
            },
            fallback: {
                assert: require.resolve('assert/'),
                crypto: require.resolve('crypto-browserify'),
                fs: require.resolve('browserify-fs'),
                http: require.resolve('stream-http'),
                https: require.resolve('https-browserify'),
                path: require.resolve('path-browserify'),
                stream: require.resolve('stream-browserify'),
                url: require.resolve('url/'),
                web3: require.resolve('web3/dist/web3.min.js'),
                zlib: require.resolve('browserify-zlib'),
            },
        },
        ignoreWarnings: [...base.ignoreWarnings, warning => {
            return ((warning?.loc?.start?.line === 7 // multiaddr / fetch-blob
                && warning?.loc?.start?.column === 30
                && warning?.loc?.end?.line === 7
                && warning?.loc?.end?.column === 51));
        }],
    },
}];
