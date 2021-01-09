
const prsAtm = require('./dist');

(async () => {
    const a = await prsAtm.producer.getAll();
    console.log(a);
})();
