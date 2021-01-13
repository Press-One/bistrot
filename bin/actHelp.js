'use strict';

const { utilitas } = require('..');
const path = require('path');
const fs = require('fs');
const [defaultName, defaultAmount, defaultBlockId, defaultHash, defaultFile] = [
    'ABCDE', '12.3456', '26621512',
    '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'keystore.json'
];
const defaultArgs = {
    blocknum: defaultBlockId,
    id: defaultBlockId,
    account: defaultName,
    name: defaultName,
    keystore: defaultFile,
    dump: defaultFile,
    pubkey: defaultHash,
    pvtkey: defaultHash,
    npubkey: defaultHash,
    address: defaultHash,
    prevkey: defaultHash,
    amount: defaultAmount,
    cpu: defaultAmount,
    ram: defaultAmount,
    net: defaultAmount,
    email: 'abc@def.com',
    chainapi: 'https://prs-bp1.press.one',
    rpcapi: 'http://51.68.201.144:8888',
    receiver: 'FIJKL',
    path: '.',
    'mx-num': '12345',
    'mx-id': '01234567-89AB-CDEF-GHIJ-KLMNOPQRSTUV',
};

let l = '=====================================================================';

const getEnding = (skip) => {
    if (!skip) { return []; }
    const ending = [
        '',
        l,
        '',
        '* Advanced:',
        '',
        '    --help     List help info for current cmd    [WITH  OR  WITHOUT ]',
        '    --json     Printing the result as JSON       [WITH  OR  WITHOUT ]',
        '    --compact  Printing JSON in compact style    [WITH  OR  WITHOUT ]',
        '    --force    Force overwrite existing file     [WITH  OR  WITHOUT ]',
        '    --spdtest  Test and pick the fastest node    [WITH  OR  WITHOUT ]',
        '    --debug    Enable or disable debug mode      [WITH  OR  WITHOUT ]',
        '    --secret   Show sensitive info in debug logs [WITH  OR  WITHOUT ]',
        '    --rpcapi   Customize PRS RPC-API endpoint    [STRING  / OPTIONAL]',
        '    --chainapi Customize PRS Chain-API endpoint  [STRING  / OPTIONAL]',
        '    ┌---------------------------------------------------------------┐',
        '    | 1. Using param `force` will increase the risk of losing data. |',
        '    | 2. `spdtest` feature depends on the system `ping` command.    |',
        '    | 3. WARNING: `secret` option may cause private key leaks.      |',
        '    └---------------------------------------------------------------┘',
        '',
        '* Security:',
        '',
        '    Using passwords or private keys on the command line interface can',
        "    be insecure. In most cases you don't need to provide passwords or",
        '    private keys in parameters. The program will request sensitive ',
        '    information in a secure way.',
    ];
    return ending;
};

const func = async (argv) => {
    argv.command = String(argv.command || '').toLowerCase();
    const acts = {};
    fs.readdirSync(__dirname).filter((file) => {
        return argv.command
            ? (`act${argv.command}.js` === file.toLowerCase())
            : (/\.js$/i.test(file) && file !== 'prs-atm.js');
    }).forEach((file) => {
        let actName = file.replace(/^(.*)\.js$/, '$1').replace(/^act/i, '');
        acts[actName] = require(path.join(__dirname, file));
    });
    const info = [`${(await utilitas.which(
        path.join(__dirname, '..', 'package.json')
    )).title}`, '', 'usage: prs-atm <command> [<args>]'];
    argv._ = argv._.map((x) => { return x.toLowerCase(); });
    let find = {};
    for (let i in acts) {
        if (argv._.length) {
            const toCheck = `${i}${acts[i].name}`.toLowerCase();
            let check = false;
            for (let j of argv._) {
                if (toCheck.includes(j)) { check = find[j] = true; break; }
            }
            if (!check) { continue; }
        } else if (acts[i].hide) { continue; }
        acts[i].help = acts[i].help || [];
        if (acts[i].pubkey || acts[i].pvtkey) {
            acts[i].help.push('    ┌- NOTICE ------------------------------------------------------┐');
        }
        if (acts[i].pubkey && acts[i].pvtkey) {
            acts[i].help.push('    | `keystore` (recommend) or `pubkey, pvtkey` must be provided.  |')
        } else if (acts[i].pubkey) {
            acts[i].help.push('    | `keystore` (recommend) or `pvtkey` must be provided.          |')
        } else if (acts[i].pvtkey) {
            acts[i].help.push('    | `keystore` (recommend) or `pvtkey` must be provided.          |')
        }
        if (acts[i].pubkey || acts[i].pvtkey) {
            acts[i].help.push('    └---------------------------------------------------------------┘');
        }
        utilitas.ensureArray(acts[i].example || {}).map((e) => {
            const strArgs = [`    $ prs-atm ${e.cmd || i}`];
            if (utilitas.isString(e.args)) {
                strArgs[0] += ` ${e.args}`;
            } else {
                for (let i in e.args) {
                    let arg = '';
                    switch (e.args[i]) {
                        case true:
                            arg = `=${defaultArgs[i]}`;
                            break;
                        case null:
                            arg = '';
                            break;
                        default:
                            arg = `=${e.args[i]}`;
                    }
                    strArgs.push(`              --${i}${arg}`);
                }
            }
            if (acts[i].help.length) { acts[i].help.push(''); }
            acts[i].help.push(
                `    > Example${e.title ? ` of ${e.title}` : ''}:`,
                strArgs.join(' \\\n')
            );
        });
        Array.prototype.push.apply(info, [
            '', l, '', `* \`${i}\` > ${acts[i].name || i}:`,
            '', ...acts[i].help]);
    }
    if (argv.command) {
        argv._ = [argv.command]; find = {};
        for (let i in acts || {}) { find[i.toLowerCase()] = acts[i]; }
    }
    argv._.map(x => {
        if (!find[x]) {
            info.push('', l, '', `* \`${x}\` > command not found.`);
        }
    });
    Array.prototype.push.apply(info, getEnding(!argv._.length));
    console.log(info.join('\n') + '\n');
};

module.exports = {
    func,
    name: 'List help info',
    example: [
        {
            title: 'listing all help info',
        },
        {
            title: 'listing help info for current command',
            cmd: 'withdraw',
            args: {
                help: null,
            }
        },
        {
            title: 'searching help info',
            args: 'ballot info',
        },
    ],
};
