'use strict';

const { utilitas, sushitrain, shot, system } = require('..');
const path = require('path');

const [exportSsConfig, packed, failed, merged] = [[
    'debug', 'secret', 'speedTest', 'keosApi',
    'rpcApi', 'shpApi', 'chainApi', 'ipfsApi',
], 'PACKED', 'FAILED', '[MERGED]'];

const verboseCheck = {
    sushitrain_inited: async (argv, data) => {
        const ssConfig = await sushitrain.config();
        exportSsConfig.map(x => {
            data[x] = Array.isArray(ssConfig[x]) && !argv.json
                ? ssConfig[x].join('\n') : ssConfig[x];
        });
        return merged;
    },
    geolocation: shot.getCurrentPosition,
    sushibar: system.chkCpVer,
    latest_released_version: async () => {
        return (await system.chkNwVer()).version;
    },
};

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
            )).version || packed;
        } catch (e) { data[`${p}_version`] = packed; }
    }
    for (let i in argv.debug ? verboseCheck : {}) {
        try {
            const resp = await verboseCheck[i](argv, data);
            if (resp !== merged) { data[i] = resp || failed; }
        } catch (e) {
            data[i] = `${failed}: ${e.message}`;
        }
    }
    return data;
};

module.exports = {
    func,
    name: 'List version info',
    help: [
        '    ┌---------------------------------------------------------------┐',
        '    | 1. Please use option `--debug` to get verbose information.    |',
        '    | 2. Please use option `--json` to get structured data.         |',
        '    └---------------------------------------------------------------┘',
    ],
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
