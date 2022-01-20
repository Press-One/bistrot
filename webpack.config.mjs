import { createRequire } from 'module';
import { fileURLToPath } from 'url';
import path from 'path';
import webpack from 'webpack';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const require = createRequire(import.meta.url);
const NodePolyfillPlugin = require('node-polyfill-webpack-plugin');
const dist = path.resolve(__dirname, 'dist');
const asyncChunks = false;

const base = {
    mode: 'production',
    entry: './main.mjs',
    optimization: { minimize: true },
    experiments: { topLevelAwait: true },
    resolve: {
        extensions: ['.mjs', '.cjs', '.js', '.json', '.node'],
        alias: {
            '@sentry/node': false,
            'fast-geoip': false,
            'ioredis': false,
            'mailgun-js': false,
            'mysql2': false,
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
    externals: [/cardinal/, { got: 'commonjs got' }],
    ignoreWarnings: [warning => {
        return ((warning?.loc?.start?.line === 82 // utilitas.event
            && warning?.loc?.start?.column === 26
            && warning?.loc?.end?.line === 82
            && warning?.loc?.end?.column === 57
        ));
    }],
    node: { __dirname: false, __filename: false, },
};

export default [{
    ...base, ...{
        target: ['node14', 'electron14-main'],
        output: {
            path: dist,
            filename: 'index.mjs',
            asyncChunks,
            libraryTarget: 'umd',
        },
    },
}, {
    ...base, ...{
        target: ['web'],
        output: {
            path: dist,
            filename: 'index.web.mjs',
            asyncChunks,
        },
        plugins: [
            new webpack.ProvidePlugin({ process: 'process/browser.js' }),
            new NodePolyfillPlugin()
        ],
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
                fs: require.resolve('browserify-fs'),
                web3: require.resolve('web3/dist/web3.min.js'),
            },
        },
        externals: [
            ...base.externals,
            { 'node:buffer': '{}' },
            { 'node:stream': '{}' },
        ]
    },
}];
