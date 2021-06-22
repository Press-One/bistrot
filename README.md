# PRS-ATM

A CLI client and also an API library for [PRESS.one](https://press.one/).

![logo](https://github.com/Press-One/prs-atm/blob/master/wiki/logo_with_text.png?raw=true "logo")

![defichart](https://github.com/Press-One/prs-atm/blob/master/wiki/defichart.jpg?raw=true "defichart")

## Install with [npm](https://www.npmjs.com/package/prs-atm)

```console
$ sudo npm config set unsafe-perm true
$ sudo npm install -g prs-atm
$ prs-atm help
```

## Run a [prs-atm container](https://hub.docker.com/repository/docker/pressone/prs-atm)

### From Docker Hub

```console
$ docker pull pressone/prs-atm
$ docker run -it --rm pressone/prs-atm prs-atm help
```

### From a Mirror Server (inside China)

```console
$ docker login -u prs-os -p pressone dockerhub.qingcloud.com
$ docker pull dockerhub.qingcloud.com/pressone/prs-atm
$ docker run -it --rm dockerhub.qingcloud.com/pressone/prs-atm prs-atm help
```

*Important: If you want to use a keystore file with the docker version, be sure to mount the path to the keystore file.*

## Instruction

```markdown
>>> 🚧 Running in source mode.
>>> 🌍 Running on testing network.
prs-atm v7.0.0

usage: prs-atm <command> [<args>]

=====================================================================

* `Account` > Check an Account:

    --name     PRESS.one account                 [STRING  / REQUIRED]

    > Example:
    $ prs-atm Account \
              --name=ABCDE

=====================================================================

* `AccountEvolve` > Evolve legacy PRESS.one / Flying Pub accounts:

    --prevkey  Legacy account, topic private key [STRING  / REQUIRED]
    --account  PRESS.one account                 [STRING  / REQUIRED]
    --keystore Path to the keystore JSON file    [STRING  / OPTIONAL]
    --password Use to decrypt the keystore       [STRING  / OPTIONAL]
    --pubkey   PRESS.one public key              [STRING  / OPTIONAL]
    --pvtkey   PRESS.one private key             [STRING  / OPTIONAL]
    ┌- NOTICE ------------------------------------------------------┐
    | `keystore` (recommend) or `pubkey, pvtkey` must be provided.  |
    └---------------------------------------------------------------┘

    > Example:
    $ prs-atm AccountEvolve \
              --prevkey=0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ \
              --account=ABCDE \
              --keystore=keystore.json

=====================================================================

* `AccountFree` > Open a Free Account:

    --keystore Path to the keystore JSON file    [STRING  / OPTIONAL]
    --pubkey   PRESS.one public key              [STRING  / OPTIONAL]
    --pvtkey   PRESS.one private key             [STRING  / OPTIONAL]
    ┌---------------------------------------------------------------┐
    | 1. After successful execution, you will get a new account.    |
    └---------------------------------------------------------------┘
    ┌- NOTICE ------------------------------------------------------┐
    | `keystore` (recommend) or `pubkey, pvtkey` must be provided.  |
    └---------------------------------------------------------------┘

    > Example:
    $ prs-atm AccountFree \
              --keystore=keystore.json

=====================================================================

* `Bp` > Check Producers Information:

    --account  PRESS.one producer name           [STRING  / OPTIONAL]
    --bound    Paging bound                      [STRING  / OPTIONAL]
    --count    Page size                         [INTEGER / OPTIONAL]
    --regexp   RegExp for matching producer name [STRING  / OPTIONAL]
    ┌---------------------------------------------------------------┐
    | 1. Run with `account` to get info of one producer.            |
    | 2. Run without `account` to get a producer list.              |
    | 3. Specify `bound` to get a producer list start from `bound`. |
    | 4. Default `count` is `50`.                                   |
    | 5. `regexp` can be keyword or regular expression.             |
    └---------------------------------------------------------------┘

    > Example of getting a producer list:
    $ prs-atm Bp

    > Example of getting info of one producer:
    $ prs-atm Bp \
              --account=ABCDE

    > Example of querying producers:
    $ prs-atm Bp \
              --regexp=^pressone

=====================================================================

* `BpReg` > Register as a Producer:

    --account  PRESS.one account                 [STRING  / REQUIRED]
    --url      URL where info about producer     [STRING  / OPTIONAL]
    --location Relative location for scheduling  [INTEGER / OPTIONAL]
    --keystore Path to the keystore JSON file    [STRING  / OPTIONAL]
    --password Use to decrypt the keystore       [STRING  / OPTIONAL]
    --pubkey   PRESS.one public key              [STRING  / OPTIONAL]
    --pvtkey   PRESS.one private key             [STRING  / OPTIONAL]
    ┌- NOTICE ------------------------------------------------------┐
    | `keystore` (recommend) or `pubkey, pvtkey` must be provided.  |
    └---------------------------------------------------------------┘

    > Example:
    $ prs-atm BpReg \
              --account=ABCDE \
              --keystore=keystore.json

=====================================================================

* `BpUnreg` > Unregister as a Producer:

    --account  PRESS.one account                 [STRING  / REQUIRED]
    --keystore Path to the keystore JSON file    [STRING  / OPTIONAL]
    --password Use to decrypt the keystore       [STRING  / OPTIONAL]
    --pvtkey   PRESS.one private key             [STRING  / OPTIONAL]
    ┌- NOTICE ------------------------------------------------------┐
    | `keystore` (recommend) or `pvtkey` must be provided.          |
    └---------------------------------------------------------------┘

    > Example:
    $ prs-atm BpUnreg \
              --account=ABCDE \
              --keystore=keystore.json

=====================================================================

* `Chain` > Check PRS-chain Information:

    ┌---------------------------------------------------------------┐
    | 1. You can use `rpcapi` param to check the specific PRS-node. |
    └---------------------------------------------------------------┘

    > Example of checking global PRS-chain Information:
    $ prs-atm Chain

    > Example of checking specific PRS-node Information:
    $ prs-atm Chain \
              --rpcapi=http://51.68.201.144:8888

=====================================================================

* `ChainBlock` > Get block by block id or block number:

    --id       `block id` or `block number`      [STR|NUM / REQUIRED]
    ┌---------------------------------------------------------------┐
    | 1. Please use option `--json` to get complete block data.     |
    └---------------------------------------------------------------┘

    > Example:
    $ prs-atm ChainBlock \
              --id=26621512 \
              --json

=====================================================================

* `ChainTail` > Display the last block / transaction of the chain:

    --blocknum Initial block num                 [NUMBER  / OPTIONAL]
    --grep     Match keyword or RegExp           [STRING  / OPTIONAL]
    --trxonly  Follow transaction instead        [WITH  OR  WITHOUT ]
    --detail   Show socket channel status        [WITH  OR  WITHOUT ]
    ┌---------------------------------------------------------------┐
    | 1. Follow the latest block / trx while `blocknum` is missing. |
    | 2. Follow trxes instead of blocks while `trxonly` is set.     |
    └---------------------------------------------------------------┘

    > Example:
    $ prs-atm ChainTail \
              --blocknum=26621512 \
              --trxonly \
              --json

    > Example:
    $ prs-atm ChainTail \
              --blocknum=26621512 \
              --trxonly \
              --json \
              --grep=PIP:2001

=====================================================================

* `ChainTrx` > Get transaction by id:

    --id       Transaction id                    [STRING  / REQUIRED]
    ┌---------------------------------------------------------------┐
    | 1. Use option `--json` to get complete transaction data.      |
    └---------------------------------------------------------------┘

    > Example:
    $ prs-atm ChainTrx \
              --id=0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ \
              --json

=====================================================================

* `Cmd` > List available commands:

    > Example of listing all commands:
    $ prs-atm Cmd

    > Example of searching commands:
    $ prs-atm Cmd account

=====================================================================

* `Config` > Configuration:

    --email    Notification email address         [EMAIL / UNDEFINED]
    --spdtest  Test and pick the fastest node     [T / F / UNDEFINED]
    --debug    Enable or disable debug mode       [T / F / UNDEFINED]
    --secret   Show sensitive info in debug logs  [T / F / UNDEFINED]
    ┌---------------------------------------------------------------┐
    | 1. Leave empty args to view current configuration.            |
    | 2. `spdtest` feature depends on the system `ping` command.    |
    | 3. WARNING: `secret` option may cause private key leaks.      |
    └---------------------------------------------------------------┘

    > Example:
    $ prs-atm Config \
              --spdtest=true \
              --debug=false \
              --secret=undefined

=====================================================================

* `Help` > List help info:

    > Example of listing all help info:
    $ prs-atm Help

    > Example of listing help info for current command:
    $ prs-atm account \
              --help

    > Example of searching help info:
    $ prs-atm Help account

=====================================================================

* `KeyUpdtActive` > Update Active Key:

    --account  PRESS.one account                 [STRING  / REQUIRED]
    --npubkey  New `active` public key           [STRING  / REQUIRED]
    --keystore Path to the keystore JSON file    [STRING  / OPTIONAL]
    --password Use to decrypt the keystore       [STRING  / OPTIONAL]
    --pvtkey   PRESS.one private key             [STRING  / OPTIONAL]
    ┌---------------------------------------------------------------┐
    | 1. You need `owner key permission` to execute this command.   |
    | 2. Use `AccountAuth` to reauthorize after you update keys.    |
    └---------------------------------------------------------------┘
    ┌- DANGER ------------------------------------------------------┐
    | ⚠ Incorrect use will result in `loss of permissions`.         |
    | ⚠ `DO NOT` do this unless you know what you are doing.        |
    | ⚠ We are not responsible for any loss of permissions due to   |
    |   the mistake of updating keys.                               |
    └---------------------------------------------------------------┘
    ┌- NOTICE ------------------------------------------------------┐
    | `keystore` (recommend) or `pvtkey` must be provided.          |
    └---------------------------------------------------------------┘

    > Example:
    $ prs-atm KeyUpdtActive \
              --account=ABCDE \
              --npubkey=0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ \
              --keystore=keystore.json

=====================================================================

* `KeyUpdtOwner` > Update Owner Key:

    --account  PRESS.one account                 [STRING  / REQUIRED]
    --npubkey  New `owner` public key            [STRING  / REQUIRED]
    --keystore Path to the keystore JSON file    [STRING  / OPTIONAL]
    --password Use to decrypt the keystore       [STRING  / OPTIONAL]
    --pvtkey   PRESS.one private key             [STRING  / OPTIONAL]
    ┌---------------------------------------------------------------┐
    | 1. You need `owner key permission` to execute this command.   |
    | 2. Use `AccountAuth` to reauthorize after you update keys.    |
    └---------------------------------------------------------------┘
    ┌- DANGER ------------------------------------------------------┐
    | ⚠ Incorrect use will result in `loss of permissions`.         |
    | ⚠ `DO NOT` do this unless you know what you are doing.        |
    | ⚠ We are not responsible for any loss of permissions due to   |
    |   the mistake of updating keys.                               |
    └---------------------------------------------------------------┘
    ┌- NOTICE ------------------------------------------------------┐
    | `keystore` (recommend) or `pvtkey` must be provided.          |
    └---------------------------------------------------------------┘

    > Example:
    $ prs-atm KeyUpdtOwner \
              --account=ABCDE \
              --npubkey=0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ \
              --keystore=keystore.json

=====================================================================

* `Keychain` > Manage Keychain:

    --account  PRESS.one account                 [STRING  / REQUIRED]
    --prmsn    Permission of the key             [STRING  / REQUIRED]
    --keystore Path to the keystore JSON file    [STRING  / REQUIRED]
    --password Use to `verify` the keystore      [STRING  / OPTIONAL]
    --memo     Memo for the keystore             [STRING  / OPTIONAL]
    --savepswd Save password (DANGEROUS)         [WITH  OR  WITHOUT ]
    --delete   To `delete` instead of to `save`  [WITH  OR  WITHOUT ]
    ┌---------------------------------------------------------------┐
    | 1. Leave empty args to view current keychain.                 |
    | 2. Save keys to the keychain for simplified use.              |
    | 3. The password is for keystore verification only.            |
    | 4. This program will `NOT` save your password by default.     |
    | 5. `savepswd` is `EXTREMELY DANGEROUS`, use on your own risk. |
    └---------------------------------------------------------------┘

    > Example of saving a new key:
    $ prs-atm Keychain \
              --account=ABCDE \
              --prmsn=owner \
              --keystore=keystore.json

    > Example of deleting an existing key:
    $ prs-atm Keychain \
              --account=ABCDE \
              --prmsn=active \
              --delete

=====================================================================

* `Keys` > Check Account Keys:

    --account  PRESS.one account                 [STRING  / REQUIRED]

    > Example:
    $ prs-atm Keys \
              --account=ABCDE

=====================================================================

* `KeystoreCreate` > Create a new Keystore (can also import keys):

    --password Use to encrypt the keystore       [STRING  / OPTIONAL]
    --pubkey   Import existing public key        [STRING  / OPTIONAL]
    --pvtkey   Import existing private key       [STRING  / OPTIONAL]
    --dump     Save keystore to a JSON file      [STRING  / OPTIONAL]

    > Example of creating a new keystore:
    $ prs-atm KeystoreCreate \
              --dump=keystore.json

    > Example of creating a keystore with existing keys:
    $ prs-atm KeystoreCreate \
              --pubkey=0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ \
              --pvtkey=0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ \
              --dump=keystore.json

=====================================================================

* `KeystoreUnlock` > Unlock a Keystore:

    --keystore Path to the keystore JSON file    [STRING  / REQUIRED]
    --password Use to decrypt the keystore       [STRING  / OPTIONAL]
    --legacy   For legacy PRESS.one keystores    [WITH  OR  WITHOUT ]
    ┌---------------------------------------------------------------┐
    | 1. You can use `legacy` to decrypt legacy PRESS.one keystores.|
    └---------------------------------------------------------------┘
    ┌---------------------------------------------------------------┐
    | This command will decrypt your keystore and display the       |
    | public key and private key. It's for advanced users only.     |
    | You don't have to do this unless you know what you are doing. |
    └---------------------------------------------------------------┘

    > Example:
    $ prs-atm KeystoreUnlock \
              --keystore=keystore.json

=====================================================================

* `SpdTest` > Evaluate the connection speed of server nodes:

    ┌---------------------------------------------------------------┐
    | 1. `spdtest` feature depends on the system `ping` command.    |
    └---------------------------------------------------------------┘

    > Example of evaluating all pre-configured nodes:
    $ prs-atm SpdTest

    > Example of evaluating a designated node:
    $ prs-atm SpdTest \
              --rpcapi=http://51.68.201.144:8888 \
              --chainapi=https://prs-bp1.press.one

=====================================================================

* `Version` > List version info:

    ┌---------------------------------------------------------------┐
    | 1. Please use option `--debug` to get verbose information.    |
    | 2. Please use option `--json` to get structured data.         |
    └---------------------------------------------------------------┘

    > Example of getting package version:
    $ prs-atm Version

    > Example of exporting info as json:
    $ prs-atm Version \
              --json

=====================================================================

* Advanced:

    --help     List help info for current cmd    [WITH  OR  WITHOUT ]
    --json     Printing the result as JSON       [WITH  OR  WITHOUT ]
    --compact  Printing JSON in compact style    [WITH  OR  WITHOUT ]
    --force    Force overwrite existing file     [WITH  OR  WITHOUT ]
    --spdtest  Test and pick the fastest node    [WITH  OR  WITHOUT ]
    --debug    Enable or disable debug mode      [WITH  OR  WITHOUT ]
    --secret   Show sensitive info in debug logs [WITH  OR  WITHOUT ]
    --rpcapi   Customize PRS RPC-API endpoint    [STRING  / OPTIONAL]
    --chainapi Customize PRS Chain-API endpoint  [STRING  / OPTIONAL]
    ┌---------------------------------------------------------------┐
    | 1. Using param `force` will increase the risk of losing data. |
    | 2. `spdtest` feature depends on the system `ping` command.    |
    | 3. WARNING: `secret` option may cause private key leaks.      |
    └---------------------------------------------------------------┘

* Security:

    Using passwords or private keys on the command line interface can
    be insecure. In most cases you don't need to provide passwords or
    private keys in parameters. The program will request sensitive 
    information in a secure way.

```
