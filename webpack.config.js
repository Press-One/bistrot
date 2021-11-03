'use strict';

const path = require('path');
const webpack = require('webpack');

const base = {
    mode: 'production',
    entry: './main.js',
    optimization: { minimize: true },
    // optimization: { minimize: false },
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
            'readline-sync': false,
            'table': false,
            'telesignsdk': false,
            'twilio': false,
            'winston-papertrail-mproved': false,
            'winston': false,
            'yargs': false,
        },
    },
    externals: [/cardinal/, /*mysql*/ { got: 'commonjs got' }, /*public-ip*/],
    ignoreWarnings: [warning => {
        return ((warning?.loc?.start?.line === 84 // utilitas.event
            && warning?.loc?.start?.column === 20
            && warning?.loc?.end?.line === 84
            && warning?.loc?.end?.column === 52
        ) || (warning?.loc?.start?.line === 27 // wasm_exec.js
            && warning?.loc?.start?.column === 19
            && warning?.loc?.end?.line === 27
            && warning?.loc?.end?.column === 26));
    }],
    node: { __dirname: false, __filename: false, },
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
        plugins: [new webpack.ProvidePlugin({ process: 'process/browser.js' })],
        resolve: {
            ...base.resolve,
            alias: {
                ...base.resolve.alias,
                child_process: false,
                module: false,
                ping: false,
                solc: false,
            },
            fallback: {
                assert: require.resolve('assert/'),
                buffer: require.resolve('buffer/'),
                crypto: require.resolve('crypto-browserify'),
                fs: require.resolve('browserify-fs'),
                http: require.resolve('stream-http'),
                https: require.resolve('https-browserify'),
                path: require.resolve('path-browserify'),
                stream: require.resolve('stream-browserify'),
                url: require.resolve('url/'),
                web3: require.resolve('web3/dist/web3.min.js'),
            },
        },
    },
}];
