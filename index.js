'use strict';

try {
    module.exports = require('./dist');
} catch (e) {
    console.log('>>> Running in source mode.')
    module.exports = require('./main');
}
