import { readdirSync } from 'fs';
import { utilitas } from '../index.mjs';

const { __dirname } = utilitas.__(import.meta.url);

const action = async (argv) => {
    const acts = {};
    const files = readdirSync(__dirname).filter((file) => {
        return /\.mjs$/i.test(file) && file.toLowerCase() !== 'bistrot.mjs';
    });
    for (let f of files) {
        let name = f.replace(/^(.*)\.mjs$/, '$1').replace(/^act/i, '').toLowerCase();
        acts[name] = { ...await import(utilitas.__(import.meta.url, f)) };
    };
    const info = {};
    argv._ = argv._.map(x => x.toLowerCase());
    const find = {};
    for (let i in acts) {
        if (argv._.length) {
            let check = false;
            for (let j of argv._) {
                if (`${i}${acts[i].name.toLowerCase()}`.includes(j)) {
                    check = find[j] = true; break;
                }
            }
            if (!check) { continue; }
        } else if (acts[i].hide) { continue; }
        info[i] = acts[i].name;
    }
    assert(Object.keys(info).length, 'Command not found.', 400);
    return info;
};

export const { func, name, help, example, render } = {
    func: action,
    name: 'List available commands',
    example: [
        {
            title: 'listing all commands',
        },
        {
            title: 'searching commands',
            args: 'account',
        },
    ],
    render: { renderAll: true, table: { KeyValue: true } },
};
