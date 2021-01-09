
const prsAtm = require('./dist/prs-atm.output.js');

(async () => {
    const a = await prsAtm.producer.getAll();
    console.log(a);
})();
