# PRS-ATM

A CLI client for [PRESS.one](https://press.one/) .

![defichart](https://github.com/Press-One/prs-atm/blob/master/wiki/defichart.jpg?raw=true "defichart")

## Install with [npm](https://www.npmjs.com/package/prs-atm)

```
# npm config set unsafe-perm true
# npm install -g prs-atm
$ prs-atm help
```

## Run a [prs-atm container](https://hub.docker.com/repository/docker/pressone/prs-atm)

### From Docker Hub

```
$ docker pull pressone/prs-atm
$ docker run -it --rm pressone/prs-atm prs-atm help
```

### From a Mirror Server (inside China)

```
$ docker login -u prs-os -p pressone dockerhub.qingcloud.com
$ docker pull dockerhub.qingcloud.com/pressone/prs-atm
$ docker run -it --rm dockerhub.qingcloud.com/pressone/prs-atm prs-atm help
```

*Important: If you want to use a keystore file with the docker version, be sure to mount the path to the keystore file.*

## Instruction

```
prs-atm v2.0.35

usage: prs-atm <command> [<args>]

=====================================================================

* `account` > Check an Account:

    --name     PRESS.one account                 [STRING  / REQUIRED]

    > Example:
    $ prs-atm account --name=ABCDE

=====================================================================

* `auth` > Update Authorization:

    --account  PRESS.one account                 [STRING  / REQUIRED]
    --keystore Path to the keystore JSON file    [STRING  / OPTIONAL]
    --password Use to decrypt the keystore       [STRING  / OPTIONAL]
    --pubkey   PRESS.one public key              [STRING  / OPTIONAL]
    --pvtkey   PRESS.one private key             [STRING  / OPTIONAL]
    ┌---------------------------------------------------------------┐
    | 1. `keystore` (recommend) or `pub/pvt key` must be provided.  |
    | 2. You have to execute this cmd to activate your new account. |
    | 3. This command only needs to be executed one time.           |
    └---------------------------------------------------------------┘

    > Example:
    $ prs-atm auth --account=ABCDE --keystore=keystore.json

=====================================================================

* `balance` > Check Balance:

    --account  PRESS.one account                 [STRING  / REQUIRED]

    > Example:
    $ prs-atm balance --account=ABCDE

=====================================================================

* `ballot` > Check Voting Information:

    --account  PRESS.one account                 [STRING  / OPTIONAL]

    > Example of checking global voting information:
    $ prs-atm ballot

    > Example of checking account's voting information:
    $ prs-atm ballot --account=ABCDE

=====================================================================

* `block` > Get block by block id or block number:

    --id       `block id` or `block number`      [STR|NUM / REQUIRED]
    ┌---------------------------------------------------------------┐
    | 1. Please use option `--json` to get complete block data.     |
    └---------------------------------------------------------------┘

    > Example:
    $ prs-atm block --id=26621512 --json

=====================================================================

* `buyram` > Buy RAM:

    --account  PRESS.one account                 [STRING  / REQUIRED]
    --receiver Receiver's PRESS.one account      [STRING  / OPTIONAL]
    --ram      PRS amount like xx.xxxx           [STRING  / OPTIONAL]
    --keystore Path to the keystore JSON file    [STRING  / OPTIONAL]
    --password Use to decrypt the keystore       [STRING  / OPTIONAL]
    --pvtkey   PRESS.one private key             [STRING  / OPTIONAL]
    ┌---------------------------------------------------------------┐
    | 1. Default `receiver` is current `account` (pvtkey holder).   |
    └---------------------------------------------------------------┘

    > Example of purchasing RAM:
    $ prs-atm buyram \
              --account=ABCDE \
              --receiver=FIJKL \
              --ram=12.3456 \
              --keystore=keystore.json

=====================================================================

* `cancel` > Cancel a depositing payment request:

    --account  PRESS.one account                 [STRING  / REQUIRED]
    --keystore Path to the keystore JSON file    [STRING  / OPTIONAL]
    --password Use to decrypt the keystore       [STRING  / OPTIONAL]
    --pvtkey   PRESS.one private key             [STRING  / OPTIONAL]
    --memo     Comment to this transaction       [STRING  / OPTIONAL]
    ┌---------------------------------------------------------------┐
    | 1. Only `1` trx (deposit / withdrawal) is allowed at a time.  |
    | 2. Cancel a current trx by this cmd before issuing a new one. |
    └---------------------------------------------------------------┘

    > Example:
    $ prs-atm cancel --account=ABCDE --keystore=keystore.json

=====================================================================

* `cmd` > List available commands:

    > Example of listing all commands:
    $ prs-atm cmd

    > Example of searching commands:
    $ prs-atm cmd ballot info

=====================================================================

* `config` > Generate the `config.ini` file:

    --account  PRESS.one account                 [STRING  / REQUIRED]
    --agent    Agent name for your PRS-node      [STRING  / OPTIONAL]
    --keystore Path to the keystore JSON file    [STRING  / OPTIONAL]
    --password Use to decrypt the keystore       [STRING  / OPTIONAL]
    --pvtkey   PRESS.one private key             [STRING  / OPTIONAL]
    --path     Folder location for saving file   [STRING  / OPTIONAL]
    ┌---------------------------------------------------------------┐
    | 1. Default `agent` is current `account` (pvtkey holder).      |
    └---------------------------------------------------------------┘

    > Example:
    $ prs-atm config --account=ABCD --path=. --keystore=keystore.json

=====================================================================

* `defichart` > Show Price Chart on DeFi (beta):

    --currency Cryptocurrency type               [STRING  / OPTIONAL]
    --period   Price period                      [STRING  / OPTIONAL]
    --interval Update interval in seconds        [INTEGER / OPTIONAL]
    ┌---------------------------------------------------------------┐
    | 1. Currency available: `BTC`(default), `ETH`, `EOS`, `PRS`.   |
    | 2. Period available: `24h`(default), `1w`, `1m`, `1y`, `max`. |
    | 3. Please use option `--json` to get raw price history.       |
    └---------------------------------------------------------------┘

    > Example:
    $ prs-atm defichart --currency=BTC --period=24h

=====================================================================

* `defimine` > Launch a DeFi Miner Daemon (beta):

    --account  PRESS.one account                 [STRING  / REQUIRED]
    --keystore Path to the keystore JSON file    [STRING  / OPTIONAL]
    --password Use to decrypt the keystore       [STRING  / OPTIONAL]
    --pubkey   PRESS.one public key              [STRING  / OPTIONAL]
    --pvtkey   PRESS.one private key             [STRING  / OPTIONAL]
    ┌---------------------------------------------------------------┐
    | 1. `keystore` (recommend) or `pub/pvt key` must be provided.  |
    └---------------------------------------------------------------┘

    > Example:
    $ prs-atm defimine --account=ABCDE --keystore=keystore.json

=====================================================================

* `defiprice` > Check Coin Prices on DeFi (beta):

    --account  PRESS.one account                 [STRING  / REQUIRED]
    --keystore Path to the keystore JSON file    [STRING  / OPTIONAL]
    --password Use to decrypt the keystore       [STRING  / OPTIONAL]
    --pubkey   PRESS.one public key              [STRING  / OPTIONAL]
    --pvtkey   PRESS.one private key             [STRING  / OPTIONAL]
    ┌---------------------------------------------------------------┐
    | 1. `keystore` (recommend) or `pub/pvt key` must be provided.  |
    └---------------------------------------------------------------┘

    > Example:
    $ prs-atm defiprice --account=ABCDE --keystore=keystore.json

=====================================================================

* `delegate` > Delegate CPU and/or Network Bandwidth:

    --account  PRESS.one account                 [STRING  / REQUIRED]
    --receiver Receiver's PRESS.one account      [STRING  / OPTIONAL]
    --cpu      PRS amount like xx.xxxx           [STRING  / OPTIONAL]
    --net      PRS amount like xx.xxxx           [STRING  / OPTIONAL]
    --keystore Path to the keystore JSON file    [STRING  / OPTIONAL]
    --password Use to decrypt the keystore       [STRING  / OPTIONAL]
    --pvtkey   PRESS.one private key             [STRING  / OPTIONAL]
    ┌---------------------------------------------------------------┐
    | 1. Default `receiver` is current `account` (pvtkey holder).   |
    | 2. One of `cpu` or `net` must be provided.                    |
    └---------------------------------------------------------------┘

    > Example of delegating CPU and NET:
    $ prs-atm delegate \
              --account=ABCDE \
              --receiver=FIJKL \
              --cpu=12.3456 \
              --net=12.3456 \
              --keystore=keystore.json

=====================================================================

* `deposit` > Deposit:

    --account  PRESS.one account                 [STRING  / REQUIRED]
    --amount   Number like xx.xxxx               [STRING  / REQUIRED]
    --keystore Path to the keystore JSON file    [STRING  / OPTIONAL]
    --password Use to decrypt the keystore       [STRING  / OPTIONAL]
    --pvtkey   PRESS.one private key             [STRING  / OPTIONAL]
    --email    Email for notification            [STRING  / OPTIONAL]
    --memo     Comment to this transaction       [STRING  / OPTIONAL]
    ┌---------------------------------------------------------------┐
    | 1. `keystore` (recommend) or `pvtkey` must be provided.       |
    | 2. After successful execution, you will get a URL.            |
    | 3. Open this URL in your browser.                             |
    | 4. Scan the QR code with Mixin to complete the payment.       |
    | 5. You have to complete the payment within `7` days.          |
    | 6. SCANNING AN EXPIRED QR CODE WILL RESULT IN LOST MONEY.     |
    | 7. Only `1` trx (deposit / withdrawal) is allowed at a time.  |
    | 8. Finish, `cancel` or timeout a current trx before request.  |
    └---------------------------------------------------------------┘

    > Example:
    $ prs-atm deposit \
              --account=ABCDE \
              --amount=12.3456 \
              --keystore=keystore.json \
              --email=abc@def.com

=====================================================================

* `evolve` > Evolve legacy PRESS.one accounts and Flying Pub topics:

    --address  Legacy account, topic address     [STRING  / REQUIRED]
    --prevkey  Legacy account, topic private key [STRING  / REQUIRED]
    --account  PRESS.one account                 [STRING  / REQUIRED]
    --keystore Path to the keystore JSON file    [STRING  / OPTIONAL]
    --password Use to decrypt the keystore       [STRING  / OPTIONAL]
    --pubkey   PRESS.one public key              [STRING  / OPTIONAL]
    --pvtkey   PRESS.one private key             [STRING  / OPTIONAL]
    ┌---------------------------------------------------------------┐
    | 1. `keystore`(recommend) or `pubkey,pvtkey` must be provided. |
    └---------------------------------------------------------------┘

    > Example:
    $ prs-atm evolve \
              --address=0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ \
              --prevkey=0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ \
              --account=ABCDE \
              --keystore=keystore.json

=====================================================================

* `genesis` > Generate the `genesis.json` file:

    --path     Folder location for saving file   [STRING  / OPTIONAL]

    > Example:
    $ prs-atm genesis --path=.

=====================================================================

* `help` > List help info:

    > Example of listing all help info:
    $ prs-atm help

    > Example of listing help info for current command:
    $ prs-atm withdraw --help

    > Example of searching help info:
    $ prs-atm help ballot info

=====================================================================

* `info` > Check PRS-chain Information:

    ┌---------------------------------------------------------------┐
    | 1. You can use `rpcapi` param to check the specific PRS-node. |
    └---------------------------------------------------------------┘

    > Example of checking global PRS-chain Information:
    $ prs-atm --action=info

    > Example of checking specific PRS-node Information:
    $ prs-atm --action=info \
              --rpcapi=http://http://127.0.0.1/:8888

=====================================================================

* `keystore` > Create a new Keystore / Import keys to a new Keystore:

    --password Use to encrypt the keystore       [STRING  / OPTIONAL]
    --pubkey   Import existing public key        [STRING  / OPTIONAL]
    --pvtkey   Import existing private key       [STRING  / OPTIONAL]
    --dump     Save keystore to a JSON file      [STRING  / OPTIONAL]

    > Example of creating a new keystore:
    $ prs-atm keystore --dump=keystore.json

    > Example of creating a keystore with existing keys:
    $ prs-atm keystore \
              --pubkey=0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ \
              --pvtkey=0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ \
              --dump=keystore.json

=====================================================================

* `openaccount` > Open an Account:

    --name     PRESS.one account                 [STRING  / REQUIRED]
    --keystore Path to the keystore JSON file    [STRING  / OPTIONAL]
    --pubkey   PRESS.one public key              [STRING  / OPTIONAL]
    ┌---------------------------------------------------------------┐
    | 1. `keystore` (recommend) or `pubkey` must be provided.       |
    | 2. After successful execution, you will get a URL.            |
    | 3. Open this URL in your browser.                             |
    | 4. Scan the QR code with Mixin to complete the payment.       |
    | 5. You will receive further notifications via Mixin.          |
    | 6. It will cost 4 PRS (2 for RAM, 1 for NET, 1 for CPU).      |
    | 7. Registration fee is NON-REFUNDABLE, EVEN IF IT FAILS.      |
    └---------------------------------------------------------------┘
    ┌- Standard Account Naming Conventions -------------------------┐
    | ■ Can only contain the characters                             |
    |   `.abcdefghijklmnopqrstuvwxyz12345`.                         |
    |   `a-z` (lowercase), `1-5` and `.` (period)                   |
    | ■ Must start with a letter                                    |
    | ■ Must be 12 characters                                       |
    | ? https://eosio-cpp.readme.io/v1.1.0/docs/naming-conventions  |
    └---------------------------------------------------------------┘

    > Example:
    $ prs-atm openaccount --name=ABCDE --keystore=keystore.json

=====================================================================

* `producers` > Check Producers Information:

    > Example:
    $ prs-atm producers

=====================================================================

* `refund` > Transfer the PRS in the refund to the balance:

    --account  PRESS.one account                 [STRING  / REQUIRED]
    --keystore Path to the keystore JSON file    [STRING  / OPTIONAL]
    --password Use to decrypt the keystore       [STRING  / OPTIONAL]
    --pvtkey   PRESS.one private key             [STRING  / OPTIONAL]
    ┌---------------------------------------------------------------┐
    | 1. `keystore` (recommend) or `pvtkey` must be provided.       |
    | 2. Applicable when REFUND_AVAILABLE shows in balance output.  |
    └---------------------------------------------------------------┘

    > Example:
    $ prs-atm refund --account=ABCDE --keystore=keystore.json

=====================================================================

* `regproducer` > Register as a Producer:

    --account  PRESS.one account                 [STRING  / REQUIRED]
    --url      URL where info about producer     [STRING  / OPTIONAL]
    --location Relative location for scheduling  [INTEGER / OPTIONAL]
    --keystore Path to the keystore JSON file    [STRING  / OPTIONAL]
    --password Use to decrypt the keystore       [STRING  / OPTIONAL]
    --pubkey   PRESS.one public key              [STRING  / OPTIONAL]
    --pvtkey   PRESS.one private key             [STRING  / OPTIONAL]
    ┌---------------------------------------------------------------┐
    | 1. `keystore` (recommend) or `pubkey` must be provided.       |
    └---------------------------------------------------------------┘

    > Example:
    $ prs-atm regproducer --account=ABCDE --keystore=keystore.json

=====================================================================

* `reward` > Claim Rewards:

    --account  PRESS.one account                 [STRING  / REQUIRED]
    --keystore Path to the keystore JSON file    [STRING  / OPTIONAL]
    --password Use to decrypt the keystore       [STRING  / OPTIONAL]
    --pvtkey   PRESS.one private key             [STRING  / OPTIONAL]
    ┌---------------------------------------------------------------┐
    | 1. `keystore` (recommend) or `pvtkey` must be provided.       |
    | 2. You can only claim your reward once a day.                 |
    └---------------------------------------------------------------┘

    > Example:
    $ prs-atm reward --account=ABCDE --keystore=keystore.json

=====================================================================

* `runsrv` > Generate the `runservice.sh` file:

    --path     Folder location for saving file   [STRING  / OPTIONAL]

    > Example:
    $ prs-atm runsrv --path=.

=====================================================================

* `spdtest` > Evaluate the connection speed of server nodes:

    ┌---------------------------------------------------------------┐
    | 1. `spdtest` feature depends on the system `ping` command.    |
    └---------------------------------------------------------------┘

    > Example of evaluating all pre-configured nodes:
    $ prs-atm spdtest

    > Example of evaluating a designated node:
    $ prs-atm spdtest \
              --rpcapi=http://51.68.201.144:8888 \
              --chainapi=https://prs-bp3.press.one

=====================================================================

* `statement` > Check Statement:

    --account  PRESS.one account                 [STRING  / REQUIRED]
    --time     Timestamp for paging              [STRING  / OPTIONAL]
    --type     Transaction Type (default 'ALL')  [STRING  / OPTIONAL]
    --count    Page size                         [NUMBER  / OPTIONAL]
    --detail   Including failed transactions     [WITH  OR  WITHOUT ]
    ┌---------------------------------------------------------------┐
    | 1. All available transaction `type`s:                         | 
    |    INCOME, EXPENSE, TRANSFER, DEPOSIT, WITHDRAW, REWARD, ALL. | 
    | 2. Default `count` is `100`.                                  |
    | 3. Default `detail` is `false`.                               |
    | 4. Set `time` as `timestamp` of last item to get next page.   |
    └---------------------------------------------------------------┘

    > Example:
    $ prs-atm statement --account=ABCDE

=====================================================================

* `tail` > Display the last block / transaction of the chain:

    --blocknum Initial block num                 [NUMBER  / OPTIONAL]
    --grep     Match keyword or RegExp           [STRING  / OPTIONAL]
    --trxonly  Follow transaction instead        [WITH  OR  WITHOUT ]
    --detail   Show socket channel status        [WITH  OR  WITHOUT ]
    ┌---------------------------------------------------------------┐
    | 1. Follow the latest block / trx while `blocknum` is missing. |
    | 2. Follow trxes instead of blocks while `trxonly` is set.     |
    └---------------------------------------------------------------┘

    > Example:
    $ prs-atm tail --blocknum=999999 --trxonly --json
    $ prs-atm tail --blocknum=999999 --trxonly --json --grep=PIP:2001

=====================================================================

* `trx` > Get transaction by id:

    --id       Transaction id                    [STRING  / REQUIRED]
    ┌---------------------------------------------------------------┐
    | 1. Use option `--json` to get complete transaction data.      |
    └---------------------------------------------------------------┘

    > Example:
    $ prs-atm trx --id=0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ --json

=====================================================================

* `undelegate` > Undelegate CPU and/or Network Bandwidth:

    --account  PRESS.one account                 [STRING  / REQUIRED]
    --receiver Receiver's PRESS.one account      [STRING  / OPTIONAL]
    --cpu      PRS amount like xx.xxxx           [STRING  / OPTIONAL]
    --net      PRS amount like xx.xxxx           [STRING  / OPTIONAL]
    --keystore Path to the keystore JSON file    [STRING  / OPTIONAL]
    --password Use to decrypt the keystore       [STRING  / OPTIONAL]
    --pvtkey   PRESS.one private key             [STRING  / OPTIONAL]
    ┌---------------------------------------------------------------┐
    | 1. Default `receiver` is current `account` (pvtkey holder).   |
    | 2. One of `cpu` or `net` must be provided.                    |
    └---------------------------------------------------------------┘

    > Example of undelegating CPU and NET:
    $ prs-atm undelegate \
              --account=ABCDE \
              --receiver=FIJKL \
              --cpu=12.3456 \
              --net=12.3456 \
              --keystore=keystore.json

=====================================================================

* `unlock` > Unlock a Keystore:

    --keystore Path to the keystore JSON file    [STRING  / REQUIRED]
    --password Use to decrypt the keystore       [STRING  / OPTIONAL]
    ┌---------------------------------------------------------------┐
    | This command will decrypt your keystore and display the       |
    | public key and private key. It's for advanced users only.     |
    | You don't have to do this unless you know what you are doing. |
    └---------------------------------------------------------------┘

    > Example:
    $ prs-atm unlock --keystore=keystore.json

=====================================================================

* `version` > List version info:

    > Example of getting package version:
    $ prs-atm version

    > Example of exporting info as json:
    $ prs-atm version --json

=====================================================================

* `vote` > Vote or Revoke Voting for Producers:

    --account  PRESS.one account                 [STRING  / OPTIONAL]
    --add      Add BP to list of voted producers [STRING  / OPTIONAL]
    --remove   Del BP to list of voted producers [STRING  / OPTIONAL]
    --keystore Path to the keystore JSON file    [STRING  / OPTIONAL]
    --password Use to decrypt the keystore       [STRING  / OPTIONAL]
    --pvtkey   PRESS.one private key             [STRING  / OPTIONAL]
    ┌---------------------------------------------------------------┐
    | 1. One of `add` or `remove` must be provided.                 |
    | 2. `add` and `remove` can be a list split by ',' or ';'.      |
    | 3. Use `ballot` cmd to check info brfore and after voting.    |
    └---------------------------------------------------------------┘

    > Example:
    $ prs-atm vote \
              --account=ABCDE \
              --add=bp1,bp2 \
              --remove=bp3,bp4 \
              --keystore=keystore.json

=====================================================================

* `withdraw` > Withdrawal:

    --account  PRESS.one account                 [STRING  / REQUIRED]
    --amount   Number like xx.xxxx               [STRING  / REQUIRED]
    --keystore Path to the keystore JSON file    [STRING  / OPTIONAL]
    --password Use to decrypt the keystore       [STRING  / OPTIONAL]
    --pvtkey   PRESS.one private key             [STRING  / OPTIONAL]
    --mx-id    Mixin user id (UUID)              [STRING  / OPTIONAL]
    --mx-num   Mixin user number                 [STRING  / OPTIONAL]
    --email    Email for notification            [STRING  / OPTIONAL]
    --memo     Comment to this transaction       [STRING  / OPTIONAL]
    ┌---------------------------------------------------------------┐
    | 1. `keystore` (recommend) or `pvtkey` must be provided.       |
    | 2. One of `mx-num` or `mx-id` must be provided.               |
    | 3. Execute the `auth` command before the first withdrawal.    |
    | 4. Sum greater than 200000 in last 24H requires manual review.| 
    | 5. Only `1` trx (deposit / withdrawal) is allowed at a time.  |
    | 6. Finish, `cancel` or timeout a current trx before request.  |
    └---------------------------------------------------------------┘
    ┌- WARNING -----------------------------------------------------┐
    | ⚠ If you withdraw via `mx-num`, for your security, you can    |
    |   only withdraw to your original Mixin payment accounts.      |
    | ⚠ If you withdraw via `mx-id`, you can withdraw to whatever   |
    |   Mixin account you want.                                     |
    | ⚠ Ensure to double-check `mx-num` or `mx-id` before withdraw. |
    |   Wrong accounts will cause property loss.                    |
    | ⚠ We are not responsible for any loss of property due to the  |
    |   mistake of withdraw accounts.                               |
    └---------------------------------------------------------------┘

    > Example of withdrawing to Mixin number (with Mixin user name):
    $ prs-atm withdraw \
              --account=ABCDE \
              --amount=12.3456 \
              --keystore=keystore.json \
              --mx-num=12345 \
              --email=abc@def.com

    > Example of withdrawing to Mixin user id:
    $ prs-atm withdraw \
              --account=ABCDE \
              --amount=12.3456 \
              --keystore=keystore.json \
              --mx-id=01234567-89AB-CDEF-GHIJ-KLMNOPQRSTUV \
              --email=abc@def.com

=====================================================================

* Advanced:

    --help     List help info for current cmd    [WITH  OR  WITHOUT ]
    --json     Printing the result as JSON       [WITH  OR  WITHOUT ]
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
