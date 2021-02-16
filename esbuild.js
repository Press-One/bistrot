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
