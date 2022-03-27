import { preference, utilitas } from '../index.mjs';

const allowedMap = { speedTest: 'spdtest' };

const checkRaw = (key) => {
    key = (allowedMap[key] || key).toLowerCase();
    for (let arg of globalThis.process.argv) {
        if (arg.toLowerCase() === `--${key}=undefined`) {
            return 'UNDEFINED';
        } else if (arg.toLowerCase().startsWith(`--${key}`)) {
            return 'SET';
        }
    }
};

const action = async (argv) => {
    const [input, conf] = [{
        email: argv.email,
        debug: argv.debug,
        secret: argv.secret,
        rpcApi: argv.rpcapi,
        chainApi: argv.chainapi,
        speedTest: argv.spdtest,
    }, {}];
    for (let key in input) {
        if (!preference.allowed.includes(key)) { continue; }
        switch (checkRaw(key)) {
            case 'UNDEFINED':
                conf[key] = undefined;
                break;
            case 'SET':
                switch (key) { case 'email': utilitas.assertEmail(input[key]); }
                conf[key] = input[key];
        }
    }
    const { filename, config } = await (Object.keys(conf).length
        ? preference.set(conf) : preference.getUserConfig());
    if (!argv.json) { console.log('CONFIG_FILENAME:', filename); }
    return config;
};

export const { func, name, help, example, render } = {
    func: action,
    name: 'Configuration',
    help: [
        '    --email    Notification email address         [EMAIL / UNDEFINED]',
        '    --spdtest  Test and pick the fastest node     [T / F / UNDEFINED]',
        '    --debug    Enable or disable debug mode       [T / F / UNDEFINED]',
        '    --secret   Show sensitive info in debug logs  [T / F / UNDEFINED]',
        '    ┌---------------------------------------------------------------┐',
        '    | 1. Leave empty args to view current configuration.            |',
        '    | 2. `spdtest` feature depends on the system `ping` command.    |',
        '    | 3. WARNING: `secret` option may cause private key leaks.      |',
        '    └---------------------------------------------------------------┘',
    ],
    example: {
        args: {
            spdtest: 'true',
            debug: 'false',
            secret: 'undefined',
        },
    },
};
