
// global.node = {
//     TEXT_NODE: 3
// };

// const prsAtm = require('.');
const prsAtm = require('./dist/prs-atm.output.js');

(async () => {
    console.log(await prsAtm.fetch.default('http://baidu.com'));
    // console.log(prsAtm.shot.getCurrentPosition.toString());
    // console.log(await prsAtm.shot.getCurrentPosition());
    // const a = await prsAtm.producer.getAll();
    // console.log(a);
})();
