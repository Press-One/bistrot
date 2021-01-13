'use strict';

const { utilitas, sushitrain, shot, system } = require('..');
const path = require('path');

const exportSsConfig = [
    'debug', 'secret', 'speedTest', 'keosApi',
    'rpcApi', 'shpApi', 'chainApi', 'ipfsApi',
];

const func = async (argv) => {
    const pkg = path.join(__dirname, '..', 'package.json');
    let data = await utilitas.which(pkg);
    data = data ? {
        package_name: data.name,
        description: data.description,
        package_version: `v${data.version}`,
        node_version: process.version,
        homepage: data.homepage,
        repository: data.repository ? data.repository.url : null,
        author: data.author,
        license: data.license,
        time: new Date().toISOString(),
    } : {};
    for (let p of ['sushitrain', 'utilitas']) {
        try {
            data[`${p}_version`] = (await utilitas.which(
                path.join(__dirname, `../node_modules/${p}/package.json`)
            )).version || 'PACKED';
        } catch (e) { data[`${p}_version`] = 'PACKED'; }
    }
    try {
        const ssConfig = await sushitrain.config();
        exportSsConfig.map(x => {
            data[x] = Array.isArray(ssConfig[x]) && !argv.json
                ? ssConfig[x].join('\n') : ssConfig[x];
        });
        data['sushitrain_inited'] = true;
    } catch (e) { data['sushitrain_inited'] = false; }
    try {
        data['geolocation'] = await shot.getCurrentPosition();
    } catch (e) { data['geolocation'] = null; }
    try {
        data['sushibar'] = await system.chkCpVer();
    } catch (e) { data['sushibar'] = null; }
    return data;
};

module.exports = {
    func,
    name: 'List version info',
    example: [
        {
            title: 'getting package version',
        },
        {
            title: 'exporting info as json',
            args: {
                json: null,
            }
        },
    ],
};
