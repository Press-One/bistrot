'use strict';

const path = require('path');

module.exports = {

    mode: 'production',

    target: [
        'node14',
        // 'electron12-main',
    ],

    entry: './index.js',

    output: {
        libraryTarget: 'commonjs',
        path: path.resolve(__dirname, 'dist'),
        filename: 'prs-atm.output.js',
    },

    resolve: {
        extensions: ['.js', '.json', '.node'],
    },

    // plugins: [
    //     new webpack.IgnorePlugin(/pg\-native/),
    // ],
    // loaders: [
    //     { test: /\.json$/, loader: 'json' },
   // other loaders
    // ],
    // module: {
		// rules: [
		// 	// all files with a `.ts` or `.tsx` extension will be handled by `ts-loader`
		// 	{
		// 		test: /\.tsx?$/,
		// 		include: path.resolve(__dirname, 'src'),
		// 		loader: "ts-loader"
		// 	}
		// 		]
		// },
    externals: [
        // /base64url/,
        // /bufferutil/,
        // /ioredis/,
        // /jsonwebtoken/,
        // /mailgun-js/,
        // /mailjet/,
        // /memcpy/,
        // /mysql2/,
        // /node-mailjet/,
        // /pg/,
        // /telesignsdk/,
        // /twilio/,
        // /utf-8-validate/,
        // /winston/,
        // {mysql2:'commonjs mysql2' },
        /pg-native/,
        // {got: 'commonjs got' },
    ],

    ignoreWarnings: [
        // warning => {
        //     return warning
        //      && warning.loc
        //      && warning.loc.start
        //      && warning.loc.end && (
        //         (
        //             warning.loc.start.line === 84
        //             && warning.loc.start.column === 20
        //             && warning.loc.end.line === 84
        //             && warning.loc.end.column === 52
        //          ) || (
        //             warning.loc.start.line === 1
        //             && warning.loc.start.column === 43
        //             && warning.loc.end.line === 1
        //             && warning.loc.end.column === 50
        //          )
        //      );
        // },
    ],

    node: {
        __dirname: false,
        __filename: false,
    },

};
