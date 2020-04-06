'use strict';

const ipfs = require('ipfs');

let ipNode = null;

const getNode = async () => {
    return ipNode = ipNode || await ipfs.create();
};


(async () => {
    try {
        // await require('./utility').timeout(500);
        // const data = await (await getNode()).cat('QmPChd2hVbrJ6bfo3WBcTW4iZnpHm8TEzWkLHmLpXhF68A');
        // const chunks = []
        // for await (const chunk of data) {
        //     chunks.push(chunk)
        // }
        // console.log('Added file contents:', Buffer.concat(chunks).toString())

        const node = await getNode();


    } catch (err) {
        console.log(err);
    }
    process.exit(0);
})();
