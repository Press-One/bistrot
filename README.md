# Bistrot

A CLI client and also an API library for [RumSystem.net](https://RumSystem.net).

![banner](https://github.com/Press-One/bistrot/blob/master/wiki/banner.jpg?raw=true "banner")

## Install with [npm](https://www.npmjs.com/package/bistrot)

```console
$ sudo npm config set unsafe-perm true
$ sudo npm install -g bistrot
$ bistrot help
```

## Run a [bistrot container](https://hub.docker.com/repository/docker/pressone/bistrot)

### From Docker Hub

```console
$ docker pull pressone/bistrot
$ docker run -it --rm pressone/bistrot bistrot help
```

### From a Mirror Server (inside China)

```console
$ docker login -u prs-os -p pressone dockerhub.qingcloud.com
$ docker pull dockerhub.qingcloud.com/pressone/bistrot
$ docker run -it --rm dockerhub.qingcloud.com/pressone/bistrot bistrot help
```

*Important: If you want to use a keystore file with the docker version, be sure to mount the path to the keystore file.*

## Instruction

```markdown
bistrot v7.4.55

usage: bistrot <command> [<args>]

=====================================================================

* `Account` > Check an Account:

    --address  Quorum account address            [STRING  / REQUIRED]

    > Example:
    $ bistrot Account \
              --address=0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ

=====================================================================

* `Block` > Get block by block id or block number:

    --id       `block id` or `block number`      [STR|NUM / REQUIRED]
    ┌---------------------------------------------------------------┐
    | 1. Please use option `--json` to get complete block data.     |
    └---------------------------------------------------------------┘

    > Example:
    $ bistrot Block \
              --id=26621512 \
              --json

=====================================================================

* `Chain` > Check QUORUM-chain Information:

    ┌---------------------------------------------------------------┐
    | 1. Use the `rpcapi` param to check the specific QUORUM-node.  |
    └---------------------------------------------------------------┘

    > Example of checking global QUORUM-chain Information:
    $ bistrot Chain

    > Example of checking specific QUORUM-node Information:
    $ bistrot Chain \
              --rpcapi=http://51.68.201.144:8888

=====================================================================

* `Cmd` > List available commands:

    > Example of listing all commands:
    $ bistrot Cmd

    > Example of searching commands:
    $ bistrot Cmd account

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
    $ bistrot Config \
              --spdtest=true \
              --debug=false \
              --secret=undefined

=====================================================================

* `Help` > List help info:

    > Example of listing all help info:
    $ bistrot Help

    > Example of listing help info for current command:
    $ bistrot account \
              --help

    > Example of searching help info:
    $ bistrot Help account

=====================================================================

* `Keychain` > Manage Keychain:

    --address  Quorum address                    [STRING  / REQUIRED]
    --keystore Path to the keystore JSON file    [STRING  / OPTIONAL]
    --pvtkey   Private key of Quorum account     [STRING  / OPTIONAL]
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
    $ bistrot Keychain \
              --keystore=keystore.json

    > Example of deleting an existing key:
    $ bistrot Keychain \
              --address=0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ \
              --delete

=====================================================================

* `KeystoreCreate` > Create a new Keystore (can also import keys):

    --password Use to encrypt the keystore       [STRING  / OPTIONAL]
    --pvtkey   Import existing private key       [STRING  / OPTIONAL]
    --dump     Save keystore to a JSON file      [STRING  / OPTIONAL]

    > Example of creating a new keystore:
    $ bistrot KeystoreCreate \
              --dump=keystore.json

    > Example of creating a keystore with existing keys:
    $ bistrot KeystoreCreate \
              --pvtkey=0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ \
              --dump=keystore.json

=====================================================================

* `KeystoreUnlock` > Unlock a Keystore:

    --keystore Path to the keystore JSON file    [STRING  / REQUIRED]
    --password Use to decrypt the keystore       [STRING  / OPTIONAL]
    ┌---------------------------------------------------------------┐
    | This command will decrypt your keystore and display the       |
    | address and private key. It's for advanced users only.        |
    | You don't have to do this unless you know what you are doing. |
    └---------------------------------------------------------------┘

    > Example:
    $ bistrot KeystoreUnlock \
              --keystore=keystore.json

=====================================================================

* `SpdTest` > Evaluate the connection speed of server nodes:

    ┌---------------------------------------------------------------┐
    | 1. `spdtest` feature depends on the system `ping` command.    |
    └---------------------------------------------------------------┘

    > Example of evaluating all pre-configured nodes:
    $ bistrot SpdTest

    > Example of evaluating a designated node:
    $ bistrot SpdTest \
              --rpcapi=http://51.68.201.144:8888 \
              --chainapi=https://prs-bp1.press.one

=====================================================================

* `Tail` > Trace the lastest block of the chain:

    --blocknum Initial block num                 [NUMBER  / OPTIONAL]
    --grep     Match keyword or RegExp           [STRING  / OPTIONAL]
    --detail   Show socket channel status        [WITH  OR  WITHOUT ]
    ┌---------------------------------------------------------------┐
    | 1. Start from the latest block while `blocknum` is missing.   |
    └---------------------------------------------------------------┘

    > Example:
    $ bistrot Tail \
              --blocknum=26621512 \
              --json

    > Example:
    $ bistrot Tail \
              --blocknum=26621512 \
              --json \
              --grep=PIP:2001

=====================================================================

* `Trx` > Get transaction by hash:

    --hash     Transaction hash                  [STRING  / REQUIRED]
    ┌---------------------------------------------------------------┐
    | 1. Use option `--json` to get complete transaction data.      |
    └---------------------------------------------------------------┘

    > Example:
    $ bistrot Trx \
              --hash=0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ \
              --json

=====================================================================

* `Version` > List version info:

    ┌---------------------------------------------------------------┐
    | 1. Please use option `--debug` to get verbose information.    |
    | 2. Please use option `--json` to get structured data.         |
    └---------------------------------------------------------------┘

    > Example of getting package version:
    $ bistrot Version

    > Example of exporting info as json:
    $ bistrot Version \
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
