'use strict';

const { utilitas, shot, shell } = require('utilitas');
const externalSource = {};
const fileCont = {};
const fs = require('fs');
const modLog = (content) => { return utilitas.modLog(content, 'BUILD ETC'); };
const patches = { /* 'file': [['x', 'y']], */ };
const path = require('path');
const quorum = require('../lib/quorum');
const targetFile = 'index.json';
const utf8 = 'utf8';

const trimCode = (content, separator) => {
    const lines = content.split('\n');
    content = [];
    lines.map(x => { (x = x.trim()) && content.push(x); });
    return content.join(separator || '');
};

(async () => {

    modLog('Patching files...');
    for (let f in patches) {
        const filename = path.join(__dirname, '..', f);
        let file = fs.readFileSync(filename, utf8).split('\n');
        for (let p of patches[f]) {
            modLog(`> ${f}: \`${p[0]}\` => \`${p[1]}\``);
            for (let l in file) { file[l] = file[l].replace(p[0], p[1]); }
        }
        fs.writeFileSync(filename, file.join('\n'), utf8);
    }

    modLog('Fetching GO wasm_exec runtime...');
    await shell.exec('cp "$(go env GOROOT)/misc/wasm/wasm_exec.js" lib/');

    modLog('Fetching files online...');
    for (let i in externalSource) {
        modLog(`> ${externalSource[i]}`);
        let content = (await shot.get(externalSource[i])).content;
        utilitas.assert(content, `Failed to fetch file: ${i}.`);
        // switch (path.extname(i).toLocaleLowerCase()) { }
        fs.writeFileSync(path.join(__dirname, i), content, utf8);
    }

    modLog('Loading files...');
    (fs.readdirSync(__dirname) || []).filter(file => {
        return file.indexOf('.') !== 0
            && !new Set([path.basename(__filename), targetFile]).has(file);
    }).forEach(file => {
        modLog(`> ${file}`);
        let content = fs.readFileSync(path.join(__dirname, file), utf8);
        if (/\.json$/.test(file)) { content = trimCode(content); }
        if (/\.sol$/.test(file)) {
            const resp = quorum.compile(content, { refresh: true });
            for (let i in resp) {
                fileCont[`abi${i}.json`] = JSON.stringify({ abi: resp[i].abi });
                for (let j in resp[i].dependencies) {
                    fileCont[j] = trimCode(resp[i].dependencies[j], '\n');
                }
            }
        }
        fileCont[file] = content;
    });

    modLog('Updating bundle...');
    modLog(`> ${targetFile}`);
    fs.writeFileSync(
        path.join(__dirname, targetFile),
        JSON.stringify(fileCont),
        { encoding: utf8, flag: 'w' }
    );

    modLog('Done!');

})();
