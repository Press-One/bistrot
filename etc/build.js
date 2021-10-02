'use strict';

const { utilitas, shot, shell } = require('utilitas');
const protobuf = require('protobufjs');
const quorum = require('../lib/quorum');
const path = require('path');
const fs = require('fs');

const modLog = (content) => { return utilitas.modLog(content, 'BUILD ETC'); };
const targetFile = 'index.json';
const fileCont = {};
const utf8 = 'utf8';
// const branch = 'master';
const branch = 'chain_dev';
const goRumRoot = `https://raw.githubusercontent.com/huo-ju/quorum/${branch}/`;
const goPbPath = `${goRumRoot}internal/pkg/pb/`;

const patches = {
    'node_modules/libp2p/src/ping/index.js': [
        ['${node._config.protocolPrefix}', 'quorum']
    ],
};

const externalSource = {
    'protoChain.proto': `${goPbPath}chain.proto?token=`
        + `AABY4PSP4S6UH4WY6E5VEJTBJUBWU`, // chain_dev
    //  + `AABY4PUUPIWRT45VU5YJ7VLBE2NSO`, // master
    'protoActivityStream.proto': `${goPbPath}activity_stream.proto?token=`
        + `AABY4PXQY4626SX7CRD2BGLBJUBZG`, // chain_dev
    //  + `AABY4PRIP5JLJ2WXC5WQZT3BE2PD4`, // master
};

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

    // modLog('Fetching files online...');
    // for (let i in externalSource) {
    //     modLog(`> ${externalSource[i]}`);
    //     let content = (await shot.get(externalSource[i])).content;
    //     utilitas.assert(content, `Failed to fetch file: ${i}.`);
    //     switch (path.extname(i).toLocaleLowerCase()) {
    //         case '.proto':
    //             i = i.replace(/\.proto$/ig, '.json');
    //             fs.writeFileSync(path.join(__dirname, i), content, utf8);
    //             const pbuf = await protobuf.load(path.join(__dirname, i));
    //             content = JSON.stringify(pbuf.toJSON(), null, 4);
    //             break;
    //     }
    //     fs.writeFileSync(path.join(__dirname, i), content, utf8);
    // }

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
