'use strict';

const { utilitas } = require('sushitrain');
const path = require('path');
const fs = require('fs');

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
        file = file.toLowerCase();
        if (argv.command) { return `act${argv.command}.js` === file; }
        return /\.js$/i.test(file) && file !== 'prs-atm.js';
    }).forEach((file) => {
        let actName = file.replace(
            /^(.*)\.js$/, '$1'
        ).replace(/^act/i, '').toLowerCase();
        acts[actName] = require(path.join(__dirname, file));
    });
    const info = [
        `${(await utilitas.which()).title}`, '',
        'usage: prs-atm <command> [<args>]'
    ];
    argv._ = argv._.map((x) => { return x.toLowerCase(); });
    let find = {};
    for (let i in acts) {
        if (argv._.length) {
            let check = false;
            for (let j of argv._) {
                if (`${i}${acts[i].name}`.includes(j)) {
                    check = find[j] = true; break;
                }
            }
            if (!check) { continue; }
        } else if (acts[i].hide) { continue; }
        Array.prototype.push.apply(info, [
            '', l, '', `* \`${i}\` > ${acts[i].name || i}:`,
            '', ...acts[i].help || []]);
    }
    if (argv.command) { argv._ = [argv.command]; find = acts; }
    argv._.map(x => {
        if (!find[x]) {
            info.push('', l, '', `* \`${x}\` > command not found.`);
        }
    });
    Array.prototype.push.apply(info, getEnding(!argv._.length));
    console.log(info.join('\n'));
};

module.exports = {
    func,
    name: 'List help info',
    help: [
        '    > Example of listing all help info:',
        '    $ prs-atm help',
        '',
        '    > Example of listing help info for current command:',
        '    $ prs-atm withdraw --help',
        '',
        '    > Example of searching help info:',
        '    $ prs-atm help ballot info',
    ],
};
