'use strict';

const webpack = require('webpack');
const path = require('path');

module.exports = {

    mode: 'production',

    target: 'electron12-main',

    entry: './index.js',

    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'prs-atm.output.js',
    },

    resolve: {
        extensions: [".js", ".json", ".node"]
    },

    // plugins: [
    //     new webpack.IgnorePlugin(/pg\-native/),
    // ],

    externals: [
        /memcpy/,
        /pg\-native/,
    ],

    node: {
        __dirname: false,
        __filename: false,
    },

};
