
// global.node = {
//     TEXT_NODE: 3
// };

const prsAtm = require('./dist/prs-atm.output.js');

(async () => {
    console.log(await prsAtm.network.getCurrentPosition());
    // const a = await prsAtm.producer.getAll();
    // console.log(a);
})();
