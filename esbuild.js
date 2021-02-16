
// https://github.com/evanw/esbuild/issues/380
// https://esbuild.github.io/api/#pure

// https://webpack.js.org/configuration/resolve/
// https://www.npmjs.com/package/esbuild-plugin-ignore/v/1.1.0
const ignorePlugin = require('esbuild-plugin-ignore');
require('esbuild').build({
    entryPoints: ['main.js'],
    bundle: true,
    platform: 'node',
    target: 'node14',
    format: 'cjs',
    external: [
        'memcpy', // eosjs-ecc
        'pg-native', // pg
        'cardinal', // mysql
        'bufferutil', // ws
        'utf-8-validate', // ws
        // { got: 'commonjs got' }, // public-ip
    ],
    plugins: [
        ignorePlugin([
            {
                resourceRegExp: /ioredis$/,
            },
            {
                resourceRegExp: /mailgun-js$/,
            },
        ])
    ],
    outfile: 'dist/index.js',
});
