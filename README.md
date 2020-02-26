# PRS-ATM

A CLI tool for financing on [PRESS.one](https://press.one/) .

## Install with [npm](https://www.npmjs.com/package/prs-atm)

```
$ npm install -g prs-atm
$ prs-atm --action=help
```

## Run a [prs-atm container](https://hub.docker.com/repository/docker/pressone/prs-atm)

```
$ docker pull pressone/prs-atm
$ docker run -it --rm pressone/prs-atm prs-atm --action=help
```

*Important: If you want to use a keystore file with the docker version, be sure to mount the path to the keystore file.*

## Instruction

```
PRESS.one ATM (v1.1.25) usage:


* Keystore:

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


* Unlock:

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


* Updateauth:

    --action   Set as 'updateauth'               [STRING  / REQUIRED]
    --account  PRESS.one account                 [STRING  / REQUIRED]
    --keystore Path to the keystore JSON file    [STRING  / OPTIONAL]
    --password Use to decrypt the keystore       [STRING  / OPTIONAL]
    --pubkey   PRESS.one public key              [STRING  / OPTIONAL]
    --pvtkey   PRESS.one private key             [STRING  / OPTIONAL]
    ┌---------------------------------------------------------------┐
    | 1. `keystore` (recommend) or `pub/pvt key` must be provided.  |
    | 2. You have to execute this cmd to enable `withdraw` feature. |
    | 3. This command only needs to be executed one time.           |
    └---------------------------------------------------------------┘

    > Example:
    $ prs-atm --action=updateauth \
              --account=ABCDE \
              --keystore=keystore.json


* Balance:

    --action   Set as 'balance'                  [STRING  / REQUIRED]
    --account  PRESS.one account                 [STRING  / REQUIRED]
    --keystore Path to the keystore JSON file    [STRING  / OPTIONAL]
    --password Use to decrypt the keystore       [STRING  / OPTIONAL]
    --pvtkey   PRESS.one private key             [STRING  / OPTIONAL]
    ┌---------------------------------------------------------------┐
    | 1. `keystore` (recommend) or `pvtkey` must be provided.       |
    └---------------------------------------------------------------┘

    > Example:
    $ prs-atm --action=balance \
              --account=ABCDE \
              --keystore=keystore.json


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
    | 5. You have to complete the payment within `10` minutes.      |
    └---------------------------------------------------------------┘

    > Example:
    $ prs-atm --action=deposit \
              --account=ABCDE \
              --amount=12.3456 \
              --keystore=keystore.json \
              --email=abc@def.com


* Withdraw:

    --action   Set as 'withdraw'                 [STRING  / REQUIRED]
    --account  PRESS.one account                 [STRING  / REQUIRED]
    --amount   Number like xx.xxxx               [STRING  / REQUIRED]
    --keystore Path to the keystore JSON file    [STRING  / OPTIONAL]
    --password Use to decrypt the keystore       [STRING  / OPTIONAL]
    --pvtkey   PRESS.one private key             [STRING  / OPTIONAL]
    --mx-id    Mixin user id (UUID)              [STRING  / OPTIONAL]
    --mx-num   Mixin user number                 [STRING  / OPTIONAL]
    --mx-name  Mixin user name                   [STRING  / OPTIONAL]
    --email    Email for notification            [STRING  / OPTIONAL]
    --memo     Comment to this transaction       [STRING  / OPTIONAL]
    ┌---------------------------------------------------------------┐
    | 1. `keystore` (recommend) or `pvtkey` must be provided.       |
    | 2. `mx-num with mx-name` or `mx-id` must be provided.         |
    | 3. Execute the `updateauth` cmd before the first withdrawal.  |
    └---------------------------------------------------------------┘

    > Example of Withdrawing to Mixin number (with Mixin user name):
    $ prs-atm --action=withdraw \
              --account=ABCDE \
              --amount=12.3456 \
              --keystore=keystore.json \
              --mx-num=12345 \
              --mx-name=ABC \
              --email=abc@def.com

    > Example of Withdrawing to Mixin user id:
    $ prs-atm --action=withdraw \
              --account=ABCDE \
              --amount=12.3456 \
              --keystore=keystore.json \
              --mx-id=01234567-89AB-CDEF-GHIJ-KLMNOPQRSTUV \
              --email=abc@def.com


* Statement:

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


* Advanced:

    --json     Printing the result as JSON       [BOOLEAN / OPTIONAL]
    --debug    Enable or disable debug mode      [BOOLEAN / OPTIONAL]
    --rpcapi   Customize RPC-API endpoint        [STRING  / OPTIONAL]
    --chainapi Customize Chain-API endpoint      [STRING  / OPTIONAL]


* Security:

    Using passwords or private keys on the command line interface can
    be insecure. In most cases you don't need to provide passwords or
    private keys in parameters. The program will request sensitive 
    information in a secure way.

```
