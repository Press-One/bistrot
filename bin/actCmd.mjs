import { fileURLToPath } from 'url';
import { utilitas } from '../index.mjs';
import fs from 'fs';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const action = async (argv) => {
    const acts = {};
    const files = fs.readdirSync(__dirname).filter((file) => {
        return /\.mjs$/i.test(file) && file.toLowerCase() !== 'bistrot.mjs';
    });
    for (let file of files) {
        let actName = file.replace(
            /^(.*)\.mjs$/, '$1'
        ).replace(/^act/i, '').toLowerCase();
        acts[actName] = { ...await import(path.join(__dirname, file)) };
    };
    const info = {};
    argv._ = argv._.map((x) => { return x.toLowerCase(); });
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
    utilitas.assert(Object.keys(info).length, 'Command not found.', 400);
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
