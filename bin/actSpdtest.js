'use strict';

global.chainConfig.speedTest = true;
global.chainConfig.debug = true;

const { sushitrain } = require('sushitrain');

const func = async (argv) => {
    await sushitrain.getRpcUrl();
};

module.exports = {
    func,
    name: 'Evaluate the connection speed of server nodes',
    help: [
        '    > Example of evaluating all pre-configured nodes:',
        '    $ prs-atm spdtest',

        '    > Example of evaluating a designated nodes:',
        '    $ prs-atm spdtest --rpcapi=http://',
        '',
        '    > Example of exporting info as json:',
        '    $ prs-atm version --json',

    ],
};
