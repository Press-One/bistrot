import { join } from 'path';
import { prepareContract, trimCode } from './lib/quorum.mjs';
import { readdirSync, readFileSync, writeFileSync } from 'fs';
import { shot, storage, utilitas } from 'utilitas';
import manifest from './package.json' assert { type: 'json' };

const __etc = utilitas.__(import.meta.url, 'etc');
const externalSource = {};
const fileCont = {};
const log = (content) => utilitas.log(content, import.meta.url);
const patches = { /* 'file': [['x', 'y']], */ };
const targetFile = 'index.json';
const utf8 = 'utf8';

log('Packing manifest...');
// https://www.stefanjudis.com/snippets/how-to-import-json-files-in-es-modules-node-js/
delete manifest.scripts;
const strManifest = [
    `const manifest = ${JSON.stringify(manifest, null, 4)};`,
    'export default manifest;',
].join('\n\n');
await storage.writeFile('./lib/manifest.mjs', strManifest);

log('Patching files...');
for (let f in patches) {
    const filename = utilitas.__(import.meta.url, f);
    let file = readFileSync(filename, utf8).split('\n');
    for (let p of patches[f]) {
        log(`> ${f}: \`${p[0]}\` => \`${p[1]}\``);
        for (let l in file) { file[l] = file[l].replace(p[0], p[1]); }
    }
    writeFileSync(filename, file.join('\n'), utf8);
}

log('Fetching files online...');
for (let i in externalSource) {
    log(`> ${externalSource[i]}`);
    let content = (await shot.get(externalSource[i])).content;
    assert(content, `Failed to fetch file: ${i}.`);
    writeFileSync(join(__etc, i), content, utf8);
}

log('Loading files...');
(readdirSync(__etc) || []).filter(
    file => file.indexOf('.') !== 0 && file !== targetFile
).forEach(file => {
    log(`> ${file}`);
    const filename = join(__etc, file);
    if (/\.json$/.test(file)) {
        fileCont[file] = trimCode(readFileSync(filename, utf8));
        console.log(fileCont[file]);
    }
    if (/\.sol$/.test(file)) {
        const resp = prepareContract(filename);
        for (let i in resp) {
            fileCont[i] = resp[i];
            console.log(fileCont[i]);
        }
    }
});

log('Updating bundle...');
log(`> ${targetFile}`);
writeFileSync(join(__etc, targetFile), JSON.stringify(fileCont), {
    encoding: utf8, flag: 'w'
});

log('Done!');
