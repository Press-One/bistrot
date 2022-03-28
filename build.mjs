import { utilitas, shot, storage } from 'utilitas';
import * as quorum from './lib/quorum.mjs';
import fs from 'fs';
import manifest from './package.json' assert { type: 'json' };
import path from 'path';

const { __dirname } = utilitas.__(import.meta.url);
const __etc = path.join(__dirname, 'etc');
const externalSource = {};
const fileCont = {};
const modLog = (content) => { return utilitas.modLog(content, 'BUILD ETC'); };
const patches = { /* 'file': [['x', 'y']], */ };
const targetFile = 'index.json';
const utf8 = 'utf8';

modLog('Packing manifest...');
// https://www.stefanjudis.com/snippets/how-to-import-json-files-in-es-modules-node-js/
delete manifest.scripts;
const strManifest = [
    `const manifest = ${JSON.stringify(manifest, null, 4)};`,
    'export default manifest;',
].join('\n\n');
await storage.writeFile('./lib/manifest.mjs', strManifest);

modLog('Patching files...');
for (let f in patches) {
    const filename = path.join(__dirname, f);
    let file = fs.readFileSync(filename, utf8).split('\n');
    for (let p of patches[f]) {
        modLog(`> ${f}: \`${p[0]}\` => \`${p[1]}\``);
        for (let l in file) { file[l] = file[l].replace(p[0], p[1]); }
    }
    fs.writeFileSync(filename, file.join('\n'), utf8);
}

modLog('Fetching files online...');
for (let i in externalSource) {
    modLog(`> ${externalSource[i]}`);
    let content = (await shot.get(externalSource[i])).content;
    assert(content, `Failed to fetch file: ${i}.`);
    fs.writeFileSync(path.join(__etc, i), content, utf8);
}

modLog('Loading files...');
(fs.readdirSync(__etc) || []).filter(
    file => file.indexOf('.') !== 0 && file !== targetFile
).forEach(file => {
    modLog(`> ${file}`);
    const filename = path.join(__etc, file);
    if (/\.json$/.test(file)) {
        fileCont[file] = quorum.trimCode(fs.readFileSync(filename, utf8));
    }
    if (/\.sol$/.test(file)) {
        const resp = quorum.prepareContract(filename);
        for (let i in resp) { fileCont[i] = resp[i]; }
    }
});

modLog('Updating bundle...');
modLog(`> ${targetFile}`);
fs.writeFileSync(path.join(__etc, targetFile), JSON.stringify(fileCont), {
    encoding: utf8, flag: 'w'
});

modLog('Done!');
