'use strict';

const { config } = require('../');

const allowedMap = { speedTest: 'spdtest' };

const checkRaw = (key) => {
    key = (allowedMap[key] || key).toLowerCase();
    for (let arg of global.process.argv) {
        if (arg.toLowerCase() === `--${key}=undefined`) {
            return 'UNDEFINED';
        } else if (arg.toLowerCase().startsWith(`--${key}`)) {
            return 'SET';
        }
    }
};

const func = async (argv) => {
    const [input, conf] = [{
        debug: argv.debug,
        secret: argv.secret,
        rpcApi: argv.rpcapi,
        chainApi: argv.chainapi,
        speedTest: argv.spdtest,
    }, {}];
    for (let key in input) {
        if (!config.allowed.includes(key)) { continue; }
        switch (checkRaw(key)) {
            case 'UNDEFINED':
                conf[key] = undefined;
                break;
            case 'SET':
                conf[key] = input[key];
        }
    }
    const { filename, config: resp } = await (Object.keys(conf).length
        ? config.set(conf) : config.getUserConfig());
    if (!argv.json) { console.log('CONFIG_FILENAME:', filename); }
    return resp;
};

module.exports = {
    func,
    name: 'Configuration',
    help: [
        '    --spdtest  Test and pick the fastest node     [T / F / UNDEFINED]',
        '    --debug    Enable or disable debug mode       [T / F / UNDEFINED]',
        '    --secret   Show sensitive info in debug logs  [T / F / UNDEFINED]',
        '    ┌---------------------------------------------------------------┐',
        '    | 1. Leave empty args to view current configuration.            |',
        '    | 2. `spdtest` feature depends on the system `ping` command.    |',
        '    | 3. WARNING: `secret` option may cause private key leaks.      |',
        '    └---------------------------------------------------------------┘',
        '',
        '    > Example:',
        '    $ prs-atm conf --spdtest=true --debug=false --secret=undefined',
    ],
    render: {
        table: {
            KeyValue: true,
            config: { columns: { 0: { width: 23 }, 1: { width: 50 } } },
        },
    },
};
