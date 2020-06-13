'use strict';

const { utilitas } = require('utilitas');
const path = require('path');
const fs = require('fs');

let l = '=====================================================================';

const getEngind = (skip) => {
    if (!skip) { return []; }
    const ending = [
        '',
        l,
        '',
        '* Advanced:',
        '',
        '    --json     Printing the result as JSON       [BOOLEAN / OPTIONAL]',
        '    --force    Force overwrite existing file     [BOOLEAN / OPTIONAL]',
        '    --debug    Enable or disable debug mode      [BOOLEAN / OPTIONAL]',
        '    --rpcapi   Customize RPC-API endpoint        [STRING  / OPTIONAL]',
        '    --chainapi Customize Chain-API endpoint      [STRING  / OPTIONAL]',
        '    ┌---------------------------------------------------------------┐',
        '    | 1. Using param `force` will increase the risk of losing data. |',
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
    const acts = {};
    fs.readdirSync(__dirname).filter((file) => {
        return /\.js$/i.test(file) && file.toLowerCase() !== 'prs-atm.js';
    }).forEach((file) => {
        let actName = file.replace(
            /^(.*)\.js$/, '$1'
        ).replace(/^act/i, '').toLowerCase();
        acts[actName] = require(path.join(__dirname, file));
    });
    const info = [`${utilitas.which().title} usage: `];
    argv._ = argv._.map((x) => { return x.toLowerCase(); });
    const find = {};
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
    argv._.map(x => {
        if (!find[x]) {
            info.push('', l, '', `# Action not found: ${x}`);
        }
    });
    Array.prototype.push.apply(info, getEngind(!argv._.length));
    console.log(info.join('\n'));
};

module.exports = {
    func,
    name: 'Get help info',
    help: [
        '    > Example of listing all help info:',
        '    $ prs-atm help',
        '',
        '    > Example of search help info you need:',
        '    $ prs-atm help ballot info',
    ],
};
