'use strict';

const path = require('path');
const fs = require('fs');

let l = '=====================================================================';

const getVersion = () => {
    let version = null;
    try {
        version = JSON.parse(
            fs.readFileSync(`${__dirname}/../package.json`)
        ).version;
    } catch (e) { }
    return version;
};

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
    const version = getVersion();
    const acts = {};
    fs.readdirSync(__dirname).filter((file) => {
        return /\.js$/i.test(file) && file.toLowerCase() !== 'prs-atm.js';
    }).forEach((file) => {
        let actName = file.replace(
            /^(.*)\.js$/, '$1'
        ).replace(/^act/i, '').toLowerCase();
        acts[actName] = require(path.join(__dirname, file));
    });
    const info = [`PRESS.one ATM ${version ? `(v${version})` : ''} usage:`];
    argv._ = argv._.map((x) => { return x.toLowerCase(); });
    const find = {};
    for (let i in acts) {
        if (argv._.length && argv._.includes(i)) {
            find[i] = true;
        } else if (argv._.length && !argv._.includes(i)) {
            continue;
        }
        Array.prototype.push.apply(info, [
            '', l, '', `* ${acts[i].name || i}:`, '', ...acts[i].help || []]);
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
    help: [
        `    --action   Set as 'help'                     [STRING  / REQUIRED]`,
        '    ┌---------------------------------------------------------------┐',
        '    | 1: You can just list help info for actions you need.          |',
        '    └---------------------------------------------------------------┘',
        '',
        '    > Example:',
        '    $ prs-atm --action=help ballot info',
    ],
};
