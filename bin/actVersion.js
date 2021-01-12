'use strict';

const { utilitas, sushitrain } = require('..');
const path = require('path');

const exportSsConfig = [
    'debug', 'secret', 'speedTest', 'keosApi',
    'rpcApi', 'shpApi', 'chainApi', 'ipfsApi',
];

const func = async (argv) => {
    const pkg = path.join(path.dirname(__filename), '..', 'package.json');
    let data = await utilitas.which(pkg);
    data = data ? {
        package_name: data.name,
        description: data.description,
        package_version: `v${data.version}`,
        node_version: process.version,
        homepage: data.homepage,
        repository: data.repository.url,
        author: data.author,
        license: data.license,
    } : {};
    for (let p of ['sushitrain', 'utilitas']) {
        data[`${p}_version`] = (await utilitas.which(
            path.join(__filename, `../../node_modules/${p}/package.json`)
        )).version;
    }
    try {
        const ssConfig = await sushitrain.config();
        exportSsConfig.map(x => { data[x] = ssConfig[x]; });
    } catch (e) { }
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
