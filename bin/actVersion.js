'use strict';

const { utilitas } = require('utilitas');

const func = (argv) => {
    const data = utilitas.which();
    return {
        package_name: data.name,
        description: data.description,
        package_version: `v${data.version}`,
        node_version: process.version,
        homepage: data.homepage,
        repository: data.repository.url,
        author: data.author,
        license: data.license,
    };
    return data;
};

module.exports = {
    func,
    name: 'Get version',
    help: [
        '    > Example of getting package version:',
        '    $ prs-atm version',
        '',
        '    > Example of exporting info as json:',
        '    $ prs-atm version --json',
    ],
    hide: true,
};
