'use strict';

try {
    module.exports = require('./main');
    console.log('>>> Running in source mode.');
} catch (e) {
    if (/cannot find module.*main/i.test(e.message)) {
        module.exports = require('./dist');
    } else { console.log(e); }
}
