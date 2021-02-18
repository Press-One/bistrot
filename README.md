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
prs-atm v5.0.3

usage: prs-atm <command> [<args>]

=====================================================================

* `Account` > Check an Account:

    --name     PRESS.one account                 [STRING  / REQUIRED]

    > Example:
    $ prs-atm Account \
              --name=ABCDE

=====================================================================

* `AccountAuth` > Update Authorization:

    --account  PRESS.one account                 [STRING  / REQUIRED]
    --keystore Path to the keystore JSON file    [STRING  / OPTIONAL]
    --password Use to decrypt the keystore       [STRING  / OPTIONAL]
    --pubkey   Active public key (NOT owner key) [STRING  / OPTIONAL]
    --pvtkey   PRESS.one private key             [STRING  / OPTIONAL]
    ┌---------------------------------------------------------------┐
    | 1. Remember to authorize your ACTIVE KEY ONLY, NOT OWNER KEY. |
    | 2. You have to execute this cmd to activate your new account. |
    | 3. Normally, this command only needs to be executed 1 time.   |
    | 4. Reauthorize after you update your active or owner keys.    |
    | 5. Auth will run automatically while withdrawing, swap, etc.  |
    └---------------------------------------------------------------┘
    ┌- NOTICE ------------------------------------------------------┐
    | `keystore` (recommend) or `pvtkey` must be provided.          |
    └---------------------------------------------------------------┘

    > Example:
    $ prs-atm AccountAuth \
              --account=ABCDE \
              --keystore=keystore.json

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

* `AccountMixin` > Bind a Mixin account to a PRESS.one account:

    --account  PRESS.one account                 [STRING  / REQUIRED]
    --keystore Path to the keystore JSON file    [STRING  / OPTIONAL]
    --pvtkey   PRESS.one private key             [STRING  / OPTIONAL]
    ┌---------------------------------------------------------------┐
    | 1. After successful execution, you will get a URL.            |
    | 2. Open this URL in your browser.                             |
    | 3. Scan the QR code with Mixin to complete the payment.       |
    | 4. You will receive further notifications via Mixin.          |
    | 5. It will cost `0.0001 PRS` for each binding.                |
    | 6. Binding fee is NON-REFUNDABLE, EVEN IF IT FAILS.           |
    | 7. You need to bind your MX account before withdraw and swap. |
    | 8. New accounts reg via PRS-ATM v4 or later have been bound.  |
    | 9. Rebind the accounts if you lost or changed your Mixin acc. |
    └---------------------------------------------------------------┘
    ┌- NOTICE ------------------------------------------------------┐
    | `keystore` (recommend) or `pvtkey` must be provided.          |
    └---------------------------------------------------------------┘

    > Example:
    $ prs-atm AccountMixin \
              --account=ABCDE \
              --keystore=keystore.json

=====================================================================

* `AccountOpen` > Open an Account:

    --account  PRESS.one account                 [STRING  / REQUIRED]
    --keystore Path to the keystore JSON file    [STRING  / OPTIONAL]
    --pubkey   PRESS.one public key              [STRING  / OPTIONAL]
    ┌---------------------------------------------------------------┐
    | 1. After successful execution, you will get a URL.            |
    | 2. Open this URL in your browser.                             |
    | 3. Scan the QR code with Mixin to complete the payment.       |
    | 4. You will receive further notifications via Mixin.          |
    | 5. It will cost 4 PRS (2 for RAM, 1 for NET, 1 for CPU).      |
    | 6. Registration fee is NON-REFUNDABLE, EVEN IF IT FAILS.      |
    └---------------------------------------------------------------┘
    ┌- Standard Account Naming Conventions -------------------------┐
    | ■ Must be 2-13 characters                                     |
    | ■ First 12 characters can be `a-z` (lowercase) or `1-5` or `.`|
    | ■ The 13th character can only be `a-j` or `1-5`               |
    | ? https://github.com/EOSIO/eos/issues/955                     |
    └---------------------------------------------------------------┘
    ┌- NOTICE ------------------------------------------------------┐
    | `keystore` (recommend) or `pvtkey` must be provided.          |
    └---------------------------------------------------------------┘

    > Example:
    $ prs-atm AccountOpen \
              --account=ABCDE \
              --keystore=keystore.json

=====================================================================

* `AssetBalance` > Check Balance:

    --account  PRESS.one account                 [STRING  / REQUIRED]

    > Example:
    $ prs-atm AssetBalance \
              --account=ABCDE

=====================================================================

* `AssetCancel` > Cancel a depositing payment request:

    --account  PRESS.one account                 [STRING  / REQUIRED]
    --keystore Path to the keystore JSON file    [STRING  / OPTIONAL]
    --password Use to decrypt the keystore       [STRING  / OPTIONAL]
    --pvtkey   PRESS.one private key             [STRING  / OPTIONAL]
    --memo     Comment to this transaction       [STRING  / OPTIONAL]
    ┌---------------------------------------------------------------┐
    | 1. Only `1` trx (deposit / withdrawal) is allowed at a time.  |
    | 2. Cancel a current trx by this cmd before issuing a new one. |
    └---------------------------------------------------------------┘
    ┌- NOTICE ------------------------------------------------------┐
    | `keystore` (recommend) or `pvtkey` must be provided.          |
    └---------------------------------------------------------------┘

    > Example:
    $ prs-atm AssetCancel \
              --account=ABCDE \
              --keystore=keystore.json

=====================================================================

* `AssetDeposit` > Deposit:

    --account  PRESS.one account                 [STRING  / REQUIRED]
    --amount   Number like xx.xxxx               [NUMBER  / REQUIRED]
    --keystore Path to the keystore JSON file    [STRING  / OPTIONAL]
    --password Use to decrypt the keystore       [STRING  / OPTIONAL]
    --pvtkey   PRESS.one private key             [STRING  / OPTIONAL]
    --email    Email for notification            [STRING  / OPTIONAL]
    --memo     Comment to this transaction       [STRING  / OPTIONAL]
    ┌- Pay via QR code ---------------------------------------------┐
    | 1. After successful execution, you will get a URL.            |
    | 2. Open this URL in your browser.                             |
    | 3. Scan the QR code with Mixin to complete the payment.       |
    └---------------------------------------------------------------┘
    ┌- Pay via Message ---------------------------------------------┐
    | 1. System will also send the URL to your bound Mixin-Account. |
    | 2. Simply click on the URL in Mixin to complete the payment.  |
    └---------------------------------------------------------------┘
    ┌---------------------------------------------------------------┐
    | 1. You have to complete the payment within `7` days.          |
    | 2. PAYING AN EXPIRED TRANSACTION WILL RESULT IN LOST MONEY.   |
    | 3. Only `1` trx (deposit / withdrawal) is allowed at a time.  |
    | 4. Finish, `AssetCancel` or timeout a trx before request.     |
    └---------------------------------------------------------------┘
    ┌- NOTICE ------------------------------------------------------┐
    | `keystore` (recommend) or `pvtkey` must be provided.          |
    └---------------------------------------------------------------┘

    > Example:
    $ prs-atm AssetDeposit \
              --account=ABCDE \
              --amount=12.3456 \
              --keystore=keystore.json \
              --email=abc@def.com

=====================================================================

* `AssetRefund` > Transfer the PRS in the refund to the balance:

    --account  PRESS.one account                 [STRING  / REQUIRED]
    --keystore Path to the keystore JSON file    [STRING  / OPTIONAL]
    --password Use to decrypt the keystore       [STRING  / OPTIONAL]
    --pvtkey   PRESS.one private key             [STRING  / OPTIONAL]
    ┌---------------------------------------------------------------┐
    | 1. Only when REFUND_AVAILABLE shows in AssetBalance output.   |
    └---------------------------------------------------------------┘
    ┌- NOTICE ------------------------------------------------------┐
    | `keystore` (recommend) or `pvtkey` must be provided.          |
    └---------------------------------------------------------------┘

    > Example:
    $ prs-atm AssetRefund \
              --account=ABCDE \
              --keystore=keystore.json

=====================================================================

* `AssetWithdraw` > Withdrawal:

    --account  PRESS.one account                 [STRING  / REQUIRED]
    --amount   Number like xx.xxxx               [NUMBER  / REQUIRED]
    --keystore Path to the keystore JSON file    [STRING  / OPTIONAL]
    --password Use to decrypt the keystore       [STRING  / OPTIONAL]
    --pvtkey   PRESS.one private key             [STRING  / OPTIONAL]
    --email    Email for notification            [STRING  / OPTIONAL]
    --memo     Comment to this transaction       [STRING  / OPTIONAL]
    ┌---------------------------------------------------------------┐
    | 1. Bind your Mixin-Account to PRS-Account before withdrawal.  |
    | 2. You can check your bound Mixin-Account with `account` cmd. |
    | 3. Sum greater than 200000 in last 24H requires manual review.| 
    | 4. Only `1` trx (deposit / withdrawal) is allowed at a time.  |
    | 5. Finish, `AssetCancel` or timeout a trx before request.     |
    | 6. If any issue, try to run `AccountAuth` command to fix it.  |
    └---------------------------------------------------------------┘
    ┌- WARNING -----------------------------------------------------┐
    | ⚠ Ensure to double-check bound Mixin-Account before withdraw. |
    |   Wrong accounts will cause property loss.                    |
    | ⚠ We are not responsible for any loss of property due to the  |
    |   mistake of withdraw accounts.                               |
    └---------------------------------------------------------------┘
    ┌- NOTICE ------------------------------------------------------┐
    | `keystore` (recommend) or `pvtkey` must be provided.          |
    └---------------------------------------------------------------┘

    > Example:
    $ prs-atm AssetWithdraw \
              --account=ABCDE \
              --amount=12.3456 \
              --keystore=keystore.json \
              --email=abc@def.com

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

* `BpBallot` > Check Voting Information:

    --account  PRESS.one account                 [STRING  / OPTIONAL]

    > Example of checking global voting information:
    $ prs-atm BpBallot

    > Example of checking account's voting information:
    $ prs-atm BpBallot \
              --account=ABCDE

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

* `BpVote` > Vote or Revoke Voting for Producers:

    --account  PRESS.one account                 [STRING  / OPTIONAL]
    --add      Add BP to list of voted producers [STRING  / OPTIONAL]
    --remove   Del BP to list of voted producers [STRING  / OPTIONAL]
    --keystore Path to the keystore JSON file    [STRING  / OPTIONAL]
    --password Use to decrypt the keystore       [STRING  / OPTIONAL]
    --pvtkey   PRESS.one private key             [STRING  / OPTIONAL]
    ┌---------------------------------------------------------------┐
    | 1. One of `add` or `remove` must be provided.                 |
    | 2. `add` and `remove` can be a list split by ',' or ';'.      |
    | 3. Use `BpBallot` cmd to check info brfore and after voting.  |
    └---------------------------------------------------------------┘
    ┌- NOTICE ------------------------------------------------------┐
    | `keystore` (recommend) or `pvtkey` must be provided.          |
    └---------------------------------------------------------------┘

    > Example:
    $ prs-atm BpVote \
              --account=ABCDE \
              --add=bp1,bp2 \
              --remove=bp3,bp4 \
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

* `ChainNode` > Get authoritative chain nodes:

    ┌---------------------------------------------------------------┐
    | 1. Please use option `--json` to get structured data.         |
    └---------------------------------------------------------------┘

    > Example:
    $ prs-atm ChainNode

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
    $ prs-atm Cmd ballot info

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

* `GenConfig` > Generate the `config.ini` file:

    --account  PRESS.one account                 [STRING  / REQUIRED]
    --agent    Agent name for your PRS-node      [STRING  / OPTIONAL]
    --keystore Path to the keystore JSON file    [STRING  / OPTIONAL]
    --password Use to decrypt the keystore       [STRING  / OPTIONAL]
    --pvtkey   PRESS.one private key             [STRING  / OPTIONAL]
    --path     Folder location for saving file   [STRING  / OPTIONAL]
    ┌---------------------------------------------------------------┐
    | 1. Default `agent` is current `account` (pvtkey holder).      |
    └---------------------------------------------------------------┘
    ┌- NOTICE ------------------------------------------------------┐
    | `keystore` (recommend) or `pubkey, pvtkey` must be provided.  |
    └---------------------------------------------------------------┘

    > Example:
    $ prs-atm GenConfig \
              --account=ABCDE \
              --path=. \
              --keystore=keystore.json

=====================================================================

* `GenGenesis` > Generate the `genesis.json` file:

    --path     Folder location for saving file   [STRING  / OPTIONAL]

    > Example:
    $ prs-atm GenGenesis \
              --path=.

=====================================================================

* `GenRunsrv` > Generate the `runservice.sh` file:

    --path     Folder location for saving file   [STRING  / OPTIONAL]

    > Example:
    $ prs-atm GenRunsrv \
              --path=.

=====================================================================

* `Help` > List help info:

    > Example of listing all help info:
    $ prs-atm Help

    > Example of listing help info for current command:
    $ prs-atm withdraw \
              --help

    > Example of searching help info:
    $ prs-atm Help ballot info

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

* `ResBuyRam` > Buy RAM:

    --account  PRESS.one account                 [STRING  / REQUIRED]
    --receiver Receiver's PRESS.one account      [STRING  / OPTIONAL]
    --ram      PRS amount like xx.xxxx           [STRING  / OPTIONAL]
    --keystore Path to the keystore JSON file    [STRING  / OPTIONAL]
    --password Use to decrypt the keystore       [STRING  / OPTIONAL]
    --pvtkey   PRESS.one private key             [STRING  / OPTIONAL]
    ┌---------------------------------------------------------------┐
    | 1. Default `receiver` is current `account` (pvtkey holder).   |
    └---------------------------------------------------------------┘
    ┌- NOTICE ------------------------------------------------------┐
    | `keystore` (recommend) or `pvtkey` must be provided.          |
    └---------------------------------------------------------------┘

    > Example:
    $ prs-atm ResBuyRam \
              --account=ABCDE \
              --receiver=FIJKL \
              --ram=12.3456 \
              --keystore=keystore.json

=====================================================================

* `ResDelegate` > Delegate CPU and/or Network Bandwidth:

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
    ┌- NOTICE ------------------------------------------------------┐
    | `keystore` (recommend) or `pvtkey` must be provided.          |
    └---------------------------------------------------------------┘

    > Example:
    $ prs-atm ResDelegate \
              --account=ABCDE \
              --receiver=FIJKL \
              --cpu=12.3456 \
              --net=12.3456 \
              --keystore=keystore.json

=====================================================================

* `ResUndelegate` > Undelegate CPU and/or Network Bandwidth:

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
    ┌- NOTICE ------------------------------------------------------┐
    | `keystore` (recommend) or `pvtkey` must be provided.          |
    └---------------------------------------------------------------┘

    > Example:
    $ prs-atm ResUndelegate \
              --account=ABCDE \
              --receiver=FIJKL \
              --cpu=12.3456 \
              --net=12.3456 \
              --keystore=keystore.json

=====================================================================

* `Reward` > Claim Rewards:

    --account  PRESS.one account                 [STRING  / REQUIRED]
    --keystore Path to the keystore JSON file    [STRING  / OPTIONAL]
    --password Use to decrypt the keystore       [STRING  / OPTIONAL]
    --pvtkey   PRESS.one private key             [STRING  / OPTIONAL]
    --daemon   Automatically reward claiming     [WITH  OR  WITHOUT ]
    ┌---------------------------------------------------------------┐
    | 1. You can only claim your reward once a day.                 |
    └---------------------------------------------------------------┘
    ┌- NOTICE ------------------------------------------------------┐
    | `keystore` (recommend) or `pvtkey` must be provided.          |
    └---------------------------------------------------------------┘

    > Example of Claiming Reward:
    $ prs-atm Reward \
              --account=ABCDE \
              --keystore=keystore.json

    > Example of Running a Daemon to Claim Reward Automatically:
    $ prs-atm Reward \
              --account=ABCDE \
              --keystore=keystore.json \
              --daemon

=====================================================================

* `RewardAuth` > Auth official node to claim rewards automatically:

    --account  PRESS.one account                 [STRING  / REQUIRED]
    --keystore Path to the keystore JSON file    [STRING  / OPTIONAL]
    --password Use to decrypt the keystore       [STRING  / OPTIONAL]
    --pvtkey   PRESS.one private key             [STRING  / OPTIONAL]
    ┌---------------------------------------------------------------┐
    | 1. This cmd creates NEW KEYS that can ONLY be used to claim.  |
    | 2. The new keys HAVE NO OTHER PERMISSIONS except claiming.    |
    | 3. The new keys will be SENT to PRESS.one official nodes.     |
    | 4. You can use `RewardUnauth` to revoke the keys.             |
    └---------------------------------------------------------------┘
    ┌- NOTICE ------------------------------------------------------┐
    | `keystore` (recommend) or `pvtkey` must be provided.          |
    └---------------------------------------------------------------┘

    > Example:
    $ prs-atm RewardAuth \
              --account=ABCDE \
              --keystore=keystore.json

=====================================================================

* `RewardUnauth` > Unauth official node of claiming rewards:

    --account  PRESS.one account                 [STRING  / REQUIRED]
    --keystore Path to the keystore JSON file    [STRING  / OPTIONAL]
    --password Use to decrypt the keystore       [STRING  / OPTIONAL]
    --pvtkey   PRESS.one private key             [STRING  / OPTIONAL]
    ┌---------------------------------------------------------------┐
    | 1. This cmd REVOKES the claiming keys on official nodes.      |
    | 2. This cmd RESETS claiming permission to `active` as well.   |
    | 3. After revoked, you will need to claim rewards by your self.|
    └---------------------------------------------------------------┘
    ┌- NOTICE ------------------------------------------------------┐
    | `keystore` (recommend) or `pvtkey` must be provided.          |
    └---------------------------------------------------------------┘

    > Example:
    $ prs-atm RewardUnauth \
              --account=ABCDE \
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

* `Statement` > Check Statement:

    --account  PRESS.one account                 [STRING  / REQUIRED]
    --time     Timestamp for paging              [STRING  / OPTIONAL]
    --type     Transaction Type (default 'ALL')  [STRING  / OPTIONAL]
    --count    Page size                         [NUMBER  / OPTIONAL]
    --detail   Including failed transactions     [WITH  OR  WITHOUT ]
    ┌---------------------------------------------------------------┐
    | 1. All available transaction `type`s:                         | 
    |    INCOME, EXPENSE, TRANSFER, DEPOSIT, WITHDRAW, REWARD, ALL. | 
    | 2. Default `count` is `50`.                                   |
    | 3. Default `detail` is `false`.                               |
    | 4. Set `time` as `timestamp` of last item to get next page.   |
    └---------------------------------------------------------------┘

    > Example:
    $ prs-atm Statement \
              --account=ABCDE

=====================================================================

* `Swap` > Swap tokens:

    --account  PRESS.one account                 [STRING  / REQUIRED]
    --from     From token symbol                 [STRING  / REQUIRED]
    --amount   Number like xx.xxxx of FROM-TOKEN [NUMBER  / REQUIRED]
    --to       To token symbol                   [STRING  / REQUIRED]
    --slippage Percentage of slippage            [NUMBER  / OPTIONAL]
    --keystore Path to the keystore JSON file    [STRING  / OPTIONAL]
    --password Use to decrypt the keystore       [STRING  / OPTIONAL]
    --pvtkey   PRESS.one private key             [STRING  / OPTIONAL]
    --email    Email for notification            [STRING  / OPTIONAL]
    --memo     Comment to this transaction       [STRING  / OPTIONAL]
    --dryrun   Evaluate a swap without executing [WITH  OR  WITHOUT ]
    ┌---------------------------------------------------------------┐
    | 1. Use `SwapPool` to get all pools that available to swap.    |
    | 2. Default `slippage` is `5`, which means a 5% slippage.      |
    | 3. You have to complete the payment within `7` days.          |
    | 4. SCANNING AN EXPIRED QR CODE WILL RESULT IN LOST MONEY.     |
    | 5. Only `1` swap transaction is allowed at a time.            |
    | 6. Finish, `SwapCancel` or timeout a current trx before swap. |
    └---------------------------------------------------------------┘
    ┌- Pay via QR code ---------------------------------------------┐
    | 1. After successful execution, you will get a URL.            |
    | 2. Open this URL in your browser.                             |
    | 3. Scan the QR code with Mixin to complete the payment.       |
    └---------------------------------------------------------------┘
    ┌- Pay via Message ---------------------------------------------┐
    | 1. System will also send the URL to your bound Mixin-Account. |
    | 2. Simply click on the URL in Mixin to complete the payment.  |
    └---------------------------------------------------------------┘
    ┌- NOTICE ------------------------------------------------------┐
    | `keystore` (recommend) or `pvtkey` must be provided.          |
    └---------------------------------------------------------------┘

    > Example of Estimating a Swap Deal (dryrun):
    $ prs-atm Swap \
              --account=ABCDE \
              --from=COB \
              --amount=12.3456 \
              --to=CNB \
              --keystore=keystore.json \
              --email=abc@def.com \
              --dryrun

    > Example of Swap:
    $ prs-atm Swap \
              --account=ABCDE \
              --from=COB \
              --amount=12.3456 \
              --to=CNB \
              --keystore=keystore.json \
              --email=abc@def.com

=====================================================================

* `SwapCancel` > Cancel a swapping payment request:

    --account  PRESS.one account                 [STRING  / REQUIRED]
    --keystore Path to the keystore JSON file    [STRING  / OPTIONAL]
    --password Use to decrypt the keystore       [STRING  / OPTIONAL]
    --pvtkey   PRESS.one private key             [STRING  / OPTIONAL]
    --memo     Comment to this transaction       [STRING  / OPTIONAL]
    ┌---------------------------------------------------------------┐
    | 1. Only `1` swap transaction is allowed at a time.            |
    | 2. Cancel a current trx by this cmd before issuing a new one. |
    └---------------------------------------------------------------┘
    ┌- NOTICE ------------------------------------------------------┐
    | `keystore` (recommend) or `pvtkey` must be provided.          |
    └---------------------------------------------------------------┘

    > Example:
    $ prs-atm SwapCancel \
              --account=ABCDE \
              --keystore=keystore.json

=====================================================================

* `SwapLqAdd` > Add Liquid to Swap Pools:

    --account  PRESS.one account                 [STRING  / REQUIRED]
    --cura     CURRENCY-A to be added            [STRING  / REQUIRED]
    --amount   Number like xx.xxxx of CURRENCY-A [NUMBER  / REQUIRED]
    --curb     CURRENCY-B to be added            [STRING  / REQUIRED]
    --keystore Path to the keystore JSON file    [STRING  / OPTIONAL]
    --password Use to decrypt the keystore       [STRING  / OPTIONAL]
    --pvtkey   PRESS.one private key             [STRING  / OPTIONAL]
    --email    Email for notification            [STRING  / OPTIONAL]
    --memo     Comment to this transaction       [STRING  / OPTIONAL]
    --dryrun   Evaluate a swap without executing [WITH  OR  WITHOUT ]
    ┌---------------------------------------------------------------┐
    | 1. Use `SwapPool` to get pools that available to add liquid.  |
    | 2. Amount of CURRENCY-B will be calculated automatically.     |
    | 3. You have to complete the payment within `7` days.          |
    | 4. SCANNING AN EXPIRED QR CODES WILL RESULT IN LOST MONEY.    |
    | 5. Only `1` swap related transaction is allowed at a time.    |
    | 6. Finish, `SwapCancel` or timeout a current trx before exec. |
    └---------------------------------------------------------------┘
    ┌- Pay via QR code ---------------------------------------------┐
    | 1. After successful execution, you will get `2` URLs.         |
    | 2. Open these URLs in your browser.                           |
    | 3. Scan the QR codes with Mixin to complete the payment.      |
    └---------------------------------------------------------------┘
    ┌- Pay via Message ---------------------------------------------┐
    | 1. System will also send the URLs to your bound Mixin-Account.|
    | 2. Simply click on the URLs in Mixin to complete the payment. |
    └---------------------------------------------------------------┘
    ┌- NOTICE ------------------------------------------------------┐
    | `keystore` (recommend) or `pvtkey` must be provided.          |
    └---------------------------------------------------------------┘

    > Example of Estimating a Liquid Adding Plan (dryrun):
    $ prs-atm SwapLqAdd \
              --account=ABCDE \
              --cura=COB \
              --amount=12.3456 \
              --curb=CNB \
              --keystore=keystore.json \
              --email=abc@def.com \
              --dryrun

    > Example of Adding Liquid:
    $ prs-atm SwapLqAdd \
              --account=ABCDE \
              --cura=COB \
              --amount=12.3456 \
              --curb=CNB \
              --keystore=keystore.json \
              --email=abc@def.com

=====================================================================

* `SwapLqRm` > Remove Liquid to Swap Pools:

    --account  PRESS.one account                 [STRING  / REQUIRED]
    --cura     CURRENCY-A to be removed          [STRING  / REQUIRED]
    --curb     CURRENCY-B to be removed          [STRING  / REQUIRED]
    --amount   Number like xx.xxxx of POOL-TOKEN [NUMBER  / REQUIRED]
    --keystore Path to the keystore JSON file    [STRING  / OPTIONAL]
    --password Use to decrypt the keystore       [STRING  / OPTIONAL]
    --pvtkey   PRESS.one private key             [STRING  / OPTIONAL]
    --email    Email for notification            [STRING  / OPTIONAL]
    --memo     Comment to this transaction       [STRING  / OPTIONAL]
    --dryrun   Evaluate a swap without executing [WITH  OR  WITHOUT ]
    ┌---------------------------------------------------------------┐
    | 1. Use `SwapPool` to get pools that available to rm liquid.   |
    | 2. Bind your Mixin-Account to PRS-Account before rm liquid.   |
    | 3. You can check your bound Mixin-Account with `account` cmd. |
    | 4. Only `1` swap related transaction is allowed at a time.    |
    | 5. Finish, `SwapCancel` or timeout a current trx before exec. |
    | 6. If any issue, try to run `AccountAuth` command to fix it.  |
    └---------------------------------------------------------------┘
    ┌- WARNING -----------------------------------------------------┐
    | ⚠ Ensure to double-check bound Mixin-Account before apply for |
    |   refund. Wrong accounts will cause property loss.            |
    | ⚠ We are not responsible for any loss of property due to the  |
    |   mistake of withdraw accounts.                               |
    └---------------------------------------------------------------┘
    ┌- NOTICE ------------------------------------------------------┐
    | `keystore` (recommend) or `pvtkey` must be provided.          |
    └---------------------------------------------------------------┘

    > Example of Estimating a Liquid Removing Plan (dryrun):
    $ prs-atm SwapLqRm \
              --account=ABCDE \
              --cura=COB \
              --curb=CNB \
              --amount=12.3456 \
              --keystore=keystore.json \
              --email=abc@def.com \
              --dryrun

    > Example of Removing Liquid:
    $ prs-atm SwapLqRm \
              --account=ABCDE \
              --cura=COB \
              --curb=CNB \
              --amount=12.3456 \
              --keystore=keystore.json \
              --email=abc@def.com

=====================================================================

* `SwapPool` > Get all pools that available to swap:

    > Example:
    $ prs-atm SwapPool

=====================================================================

* `SwapStmt` > Check Swap Statement:

    --account  PRESS.one account                 [STRING  / REQUIRED]
    --time     Timestamp for paging              [STRING  / OPTIONAL]
    --count    Page size                         [NUMBER  / OPTIONAL]
    ┌---------------------------------------------------------------┐
    | 1. Default `count` is `100`.                                  |
    | 2. Set `time` as `timestamp` of last item to get next page.   |
    └---------------------------------------------------------------┘

    > Example:
    $ prs-atm SwapStmt \
              --account=ABCDE

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
