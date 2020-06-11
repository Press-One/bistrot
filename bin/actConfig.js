'use strict';

const { } = require('../index');

const func = async (argv) => {
    return resp;
};

module.exports = {
    func,
    help: [
        '* Generate the `config.ini` file:',
        '',
        "    --action   Set as 'config'                  [STRING  / REQUIRED]",
        '    --account  PRESS.one account                 [STRING  / REQUIRED]',
        '    --agent    Agent name for your PRS-node      [STRING  / OPTIONAL]',
        '    --keystore Path to the keystore JSON file    [STRING  / OPTIONAL]',
        '    --password Use to decrypt the keystore       [STRING  / OPTIONAL]',
        '    --pvtkey   PRESS.one private key             [STRING  / OPTIONAL]',
        '    --path     Folder location for saving file   [STRING  / OPTIONAL]',
        '    ┌---------------------------------------------------------------┐',
        '    | 1. Default `agent` is current `account` (pvtkey holder).      |',
        '    └---------------------------------------------------------------┘',
        '',
        '    > Example:',
        '    $ prs-atm --action=config \\',
        '              --account=ABCDE \\',
        '              --path=. \\',
        '              --keystore=keystore.json',
    ],
};
