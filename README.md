# PRS-ATM

A CLI tool for financing on [PRESS.one](https://press.one/) .

## Install with [npm](https://www.npmjs.com/package/prs-atm)

```
$ npm install -g prs-atm
$ prs-atm --action=help
```

## Run a [prs-atm container](https://hub.docker.com/repository/docker/pressone/prs-atm)

### From Docker Hub

```
$ docker pull pressone/prs-atm
$ docker run -it --rm pressone/prs-atm prs-atm --action=help
```

### From a Mirror Server (inside China)

```
$ docker login -u prs-os -p pressone dockerhub.qingcloud.com
$ docker pull dockerhub.qingcloud.com/pressone/prs-atm
$ docker run -it --rm dockerhub.qingcloud.com/pressone/prs-atm prs-atm --action=help
```

*Important: If you want to use a keystore file with the docker version, be sure to mount the path to the keystore file.*

## Instruction

```
PRESS.one ATM (v1.1.40) usage:

=====================================================================

* Create a new Keystore / Import keys to a new Keystore:

    --action   Set as 'keystore'                 [STRING  / REQUIRED]
    --password Use to encrypt the keystore       [STRING  / OPTIONAL]
    --pubkey   Import existing public key        [STRING  / OPTIONAL]
    --pvtkey   Import existing private key       [STRING  / OPTIONAL]
    --dump     Save keystore to a JSON file      [STRING  / OPTIONAL]

    > Example of creating a new keystore:
    $ prs-atm --action=keystore \
              --dump=keystore.json

    > Example of creating a keystore with existing keys:
    $ prs-atm --action=keystore \
              --pubkey=0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ \
              --pvtkey=0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ \
              --dump=keystore.json

=====================================================================

* Unlock a Keystore:

    --action   Set as 'unlock'                   [STRING  / REQUIRED]
    --keystore Path to the keystore JSON file    [STRING  / REQUIRED]
    --password Use to decrypt the keystore       [STRING  / OPTIONAL]
    ┌---------------------------------------------------------------┐
    | This command will decrypt your keystore and display the       |
    | public key and private key. It's for advanced users only.     |
    | You don't have to do this unless you know what you are doing. |
    └---------------------------------------------------------------┘

    > Example:
    $ prs-atm --action=unlock \
              --keystore=keystore.json

=====================================================================

* Update Authorization:

    --action   Set as 'auth'                     [STRING  / REQUIRED]
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
    $ prs-atm --action=auth \
              --account=ABCDE \
              --keystore=keystore.json

=====================================================================

* Claim Rewards:

    --action   Set as 'reward'                   [STRING  / REQUIRED]
    --account  PRESS.one account                 [STRING  / REQUIRED]
    --keystore Path to the keystore JSON file    [STRING  / OPTIONAL]
    --password Use to decrypt the keystore       [STRING  / OPTIONAL]
    --pvtkey   PRESS.one private key             [STRING  / OPTIONAL]
    ┌---------------------------------------------------------------┐
    | 1. `keystore` (recommend) or `pvtkey` must be provided.       |
    | 2. You can only claim your reward once a day.                 |
    └---------------------------------------------------------------┘

    > Example:
    $ prs-atm --action=reward \
              --account=ABCDE \
              --keystore=keystore.json

=====================================================================

* Check Balance:

    --action   Set as 'balance'                  [STRING  / REQUIRED]
    --account  PRESS.one account                 [STRING  / REQUIRED]

    > Example:
    $ prs-atm --action=balance \
              --account=ABCDE

=====================================================================

* Check Account:

    --action   Set as 'account'                  [STRING  / REQUIRED]
    --account  PRESS.one account                 [STRING  / REQUIRED]

    > Example:
    $ prs-atm --action=account \
              --account=ABCDE

=====================================================================

* Open Account:

    --action   Set as 'openaccount'              [STRING  / REQUIRED]
    --account  PRESS.one account                 [STRING  / REQUIRED]
    --keystore Path to the keystore JSON file    [STRING  / OPTIONAL]
    --pubkey   PRESS.one public key              [STRING  / OPTIONAL]
    ┌---------------------------------------------------------------┐
    | 1. `keystore` (recommend) or `pubkey` must be provided.       |
    | 2. After successful execution, you will get a URL.            |
    | 3. Open this URL in your browser.                             |
    | 4. Scan the QR code with Mixin to complete the payment.       |
    | 5. You will receive further notifications via Mixin.          |
    └---------------------------------------------------------------┘

    > Example:
    $ prs-atm --action=openaccount \
              --account=ABCDE \
              --keystore=keystore.json

=====================================================================

* Check PRS-chain Information:

    --action   Set as 'info'                     [STRING  / REQUIRED]
    ┌---------------------------------------------------------------┐
    | 1. You can use `rpcapi` param to check the specific PRS-node. |
    └---------------------------------------------------------------┘

    > Example of checking global PRS-chain Information:
    $ prs-atm --action=info

    > Example of checking specific PRS-node Information:
    $ prs-atm --action=info \
              --rpcapi=http://http://127.0.0.1/:8888

=====================================================================

* Check Producers Information:

    --action   Set as 'producers'                [STRING  / REQUIRED]

    > Example:
    $ prs-atm --action=producers

=====================================================================

* Check Statement:

    --action   Set as 'statement'                [STRING  / REQUIRED]
    --account  PRESS.one account                 [STRING  / REQUIRED]
    --time     Timestamp for paging              [STRING  / OPTIONAL]
    --type     Can be 'INCOME', 'EXPENSE', 'ALL' [STRING  / OPTIONAL]
    --count    Page size                         [NUMBER  / OPTIONAL]
    ┌---------------------------------------------------------------┐
    | 1. Default `type` is 'ALL'.                                   |
    | 2. Default `count` is 100.                                    |
    | 3. Set `time` as `timestamp` of last item to get next page.   |
    └---------------------------------------------------------------┘

    > Example:
    $ prs-atm --action=statement \
              --account=ABCDE

=====================================================================

* Deposit:

    --action   Set as 'deposit'                  [STRING  / REQUIRED]
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
    $ prs-atm --action=deposit \
              --account=ABCDE \
              --amount=12.3456 \
              --keystore=keystore.json \
              --email=abc@def.com

=====================================================================

* Withdrawal:

    --action   Set as 'withdraw'                 [STRING  / REQUIRED]
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
    | 4. You can only withdraw to the original MX payment accounts. |
    | 5. Only `1` trx (deposit / withdrawal) is allowed at a time.  |
    | 6. Finish, `cancel` or timeout a current trx before request.  |
    └---------------------------------------------------------------┘

    > Example of Withdrawing to Mixin number (with Mixin user name):
    $ prs-atm --action=withdraw \
              --account=ABCDE \
              --amount=12.3456 \
              --keystore=keystore.json \
              --mx-num=12345 \
              --email=abc@def.com

    > Example of Withdrawing to Mixin user id:
    $ prs-atm --action=withdraw \
              --account=ABCDE \
              --amount=12.3456 \
              --keystore=keystore.json \
              --mx-id=01234567-89AB-CDEF-GHIJ-KLMNOPQRSTUV \
              --email=abc@def.com

=====================================================================

* Cancel a depositing payment request:

    --action   Set as 'cancel'                   [STRING  / REQUIRED]
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
    $ prs-atm --action=cancel \
              --account=ABCDE \
              --keystore=keystore.json

=====================================================================

* Check Voting Information:

    --action   Set as 'ballot'                   [STRING  / REQUIRED]
    --account  PRESS.one account                 [STRING  / OPTIONAL]

    > Example of checking global voting information:
    $ prs-atm --action=ballot

    > Example of checking account's voting information:
    $ prs-atm --action=ballot \
              --account=ABCDE

=====================================================================

* Vote or Revoke Voting for Producers:

    --action   Set as 'vote'                     [STRING  / REQUIRED]
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
    $ prs-atm --action=vote \
              --account=ABCDE \
              --add=bp1,bp2 \
              --remove=bp3,bp4 \
              --keystore=keystore.json

=====================================================================

* Delegate/Undelegate CPU and/or Network Bandwidth:

    --action   Set as 'deposit' or 'undelegate'  [STRING  / REQUIRED]
    --account  PRESS.one account                 [STRING  / REQUIRED]
    --receiver Receiver's PRESS.one account      [STRING  / OPTIONAL]
    --cpu      PRS amount like xx.xxxx           [STRING  / OPTIONAL]
    --net      PRS amount like xx.xxxx           [STRING  / OPTIONAL]
    --keystore Path to the keystore JSON file    [STRING  / OPTIONAL]
    --password Use to decrypt the keystore       [STRING  / OPTIONAL]
    --pvtkey   PRESS.one private key             [STRING  / OPTIONAL]
    --memo     Comment to this transaction       [STRING  / OPTIONAL]
    ┌---------------------------------------------------------------┐
    | 1. Default `receiver` is current `account` (pvtkey holder).   |
    | 2. One of `cpu` or `net` must be provided.                    |
    └---------------------------------------------------------------┘

    > Example of delegating CPU and NET:
    $ prs-atm --action=delegate \
              --account=ABCDE \
              --receiver=FIJKL \
              --cpu=12.3456 \
              --net=12.3456 \
              --keystore=keystore.json

    > Example of undelegating CPU and NET:
    $ prs-atm --action=undelegate \
              --account=ABCDE \
              --receiver=FIJKL \
              --cpu=12.3456 \
              --net=12.3456 \
              --keystore=keystore.json

=====================================================================

* Generate the `genesis.json` file:

    --action   Set as 'genesis'                  [STRING  / REQUIRED]
    --path     Folder location for saving file   [STRING  / OPTIONAL]

    > Example:
    $ prs-atm --action=genesis \
              --path=.

=====================================================================

* Generate the `config.ini` file:

    --action   Set as 'config'                  [STRING  / REQUIRED]
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
    $ prs-atm --action=config \
              --account=ABCDE \
              --path=. \
              --keystore=keystore.json

=====================================================================

* Generate the `runservice.sh` file:

    --action   Set as 'runsrv'                   [STRING  / REQUIRED]
    --path     Folder location for saving file   [STRING  / OPTIONAL]

    > Example:
    $ prs-atm --action=runsrv \
              --path=.

=====================================================================

* Advanced:

    --json     Printing the result as JSON       [BOOLEAN / OPTIONAL]
    --force    Force overwrite existing file     [BOOLEAN / OPTIONAL]
    --debug    Enable or disable debug mode      [BOOLEAN / OPTIONAL]
    --rpcapi   Customize RPC-API endpoint        [STRING  / OPTIONAL]
    --chainapi Customize Chain-API endpoint      [STRING  / OPTIONAL]
    ┌---------------------------------------------------------------┐
    | 1. Using param `force` will increase the risk of losing data. |
    └---------------------------------------------------------------┘

=====================================================================

* Security:

    Using passwords or private keys on the command line interface can
    be insecure. In most cases you don't need to provide passwords or
    private keys in parameters. The program will request sensitive 
    information in a secure way.

```
