'use strict';

const { utilitas } = require('..');
const path = require('path');

const func = async (argv) => {
    const pkg = path.join(path.dirname(__filename), '..', 'package.json');
    const data = await utilitas.which(pkg);
    return data && {
        package_name: data.name,
        description: data.description,
        package_version: `v${data.version}`,
        node_version: process.version,
        homepage: data.homepage,
        repository: data.repository.url,
        author: data.author,
        license: data.license,
    };
};

module.exports = {
    func,
    name: 'List version info',
    help: [
        '    > Example of getting package version:',
        '    $ prs-atm version',
        '',
        '    > Example of exporting info as json:',
        '    $ prs-atm version --json',
    ],
};
