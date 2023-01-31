import { readdirSync } from 'fs';
import { utilitas } from '../index.mjs';

const { __dirname } = utilitas.__(import.meta.url);

const [defName, receiver, defAmount, defBlockId, defOut, defHash, defFile] = [
    'ABCDE', 'FIJKL', '12.3456', '26621512', 'MAGNET',
    '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'keystore.json',
];

const defaultArgs = {
    'mx-id': '01234567-89AB-CDEF-GHIJ-KLMNOPQRSTUV',
    'mx-num': '12345',
    account: defName,
    address: defHash,
    amount: defAmount,
    blocknum: defBlockId,
    chainapi: 'https://prs-bp1.press.one',
    dump: defFile,
    email: 'abc@def.com',
    id: defBlockId,
    keystore: defFile,
    name: defName,
    out: defOut,
    path: '.',
    payee: receiver,
    prevkey: defHash,
    pubkey: defHash,
    pvtkey: defHash,
    rpcapi: 'http://51.68.201.144:8888',
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
        '    --debug    Enable or disable debug mode      [WITH  OR  WITHOUT ]',
        '    --rpcapi   Customize PRS RPC-API endpoint    [STRING  / OPTIONAL]',
        '    --chainapi Customize PRS Chain-API endpoint  [STRING  / OPTIONAL]',
        '    --mvm      Use MVM RPC-API endpoint          [STRING  / OPTIONAL]',
        '    ┌---------------------------------------------------------------┐',
        '    | 1. Using param `force` will increase the risk of losing data. |',
        '    └---------------------------------------------------------------┘',
        '',
        '* Security:',
        '',
        '    Using passwords or private keys on the command line interface can',
        '    be insecure.',
    ];
    return ending;
};

const action = async (argv) => {
    argv.command = String(argv.command || '').toLowerCase();
    const acts = {};
    const files = readdirSync(__dirname).filter(file => argv.command
        ? (`act${argv.command}.mjs` === file.toLowerCase())
        : (/\.mjs$/i.test(file) && file !== 'bistrot.mjs')
    );
    for (let f of files) {
        let name = f.replace(/^(.*)\.mjs$/, '$1').replace(/^act/i, '');
        acts[name] = { ...await import(utilitas.__(import.meta.url, f)) };
    };
    const info = [`${(await utilitas.which(
        utilitas.__(import.meta.url, '../package.json')
    )).title}`, '', 'usage: bistrot <command> [<args>]'];
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
        if (acts[i].address || acts[i].pvtkey) {
            acts[i].help.push('    ┌- NOTICE ------------------------------------------------------┐');
        }
        if (acts[i].pvtkey) {
            acts[i].help.push('    | `keystore` (recommend) or `pvtkey` must be provided.          |')
        } else if (acts[i].address) {
            acts[i].help.push('    | `keystore` (recommend) or `address` must be provided.         |')
        }
        if (acts[i].address || acts[i].pvtkey) {
            acts[i].help.push('    └---------------------------------------------------------------┘');
        }
        utilitas.ensureArray(acts[i].example || {}).map((e) => {
            const strArgs = [`    $ bistrot ${e.cmd || i}`];
            if (String.isString(e.args)) {
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

export const { func, name, help, example, render } = {
    func: action,
    name: 'List help info',
    example: [
        {
            title: 'listing all help info',
        },
        {
            title: 'listing help info for current command',
            cmd: 'account',
            args: {
                help: null,
            }
        },
        {
            title: 'searching help info',
            args: 'account',
        },
    ],
};
