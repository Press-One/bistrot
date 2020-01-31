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

## Instruction

```

* Balance:
    --key      PRESS.one private key          [STRING  / REQUIRED]
    --account  PRESS.one account              [STRING  / REQUIRED]

* Deposit:
    --action   Set as 'deposit'               [STRING  / REQUIRED]
    --key      PRESS.one private key          [STRING  / REQUIRED]
    --account  PRESS.one account              [STRING  / REQUIRED]
    --amount   Number like xx.xxxx            [STRING  / REQUIRED]
    --email    Email for notification         [STRING  / OPTIONAL]
    --memo     Comment to this transaction    [STRING  / OPTIONAL]
    ┌------------------------------------------------------------┐
    | (1) After successful execution, you will get a URL.        |
    | (2) Open this URL in your browser.                         |
    | (3) Scan the QR code with Mixin to complete the payment.   |
    | (4) You have to complete the payment within `10` minutes.  |
    └------------------------------------------------------------┘

* Withdraw to Mixin number (with Mixin user name):
    --action   Set as 'withdraw'              [STRING  / REQUIRED]
    --key      PRESS.one private key          [STRING  / REQUIRED]
    --account  PRESS.one account              [STRING  / REQUIRED]
    --mx-num   Mixin user number              [STRING  / REQUIRED]
    --mx-name  Mixin user name                [STRING  / REQUIRED]
    --amount   Number like xx.xxxx            [STRING  / REQUIRED]
    --email    Email for notification         [STRING  / OPTIONAL]
    --memo     Comment to this transaction    [STRING  / OPTIONAL]

* Withdraw to Mixin user id:
    --action   Set as 'withdraw'              [STRING  / REQUIRED]
    --key      PRESS.one private key          [STRING  / REQUIRED]
    --account  PRESS.one account              [STRING  / REQUIRED]
    --mx-id    Mixin user id (UUID)           [STRING  / REQUIRED]
    --amount   Number like xx.xxxx            [STRING  / REQUIRED]
    --email    Email for notification         [STRING  / OPTIONAL]
    --memo     Comment to this transaction    [STRING  / OPTIONAL]

* Advanced:
    --debug    Enable or disable debug mode   [BOOLEAN / OPTIONAL]
    --api      Customize RPC API endpoint     [STRING  / OPTIONAL]

* Demo:
    $ prs-atm --action=balance \
              --key=0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456 \
              --account=ABCDE
    $ prs-atm --action=deposit \
              --key=0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456 \
              --account=ABCDE \
              --amount=12.3456 \
              --email=abc@def.com
    $ prs-atm --action=withdraw \
              --key=0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456 \
              --account=ABCDE \
              --mx-num=12345 \
              --mx-name=ABC \
              --amount=12.3456 \
              --email=abc@def.com
    $ prs-atm --action=withdraw \
              --key=0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456 \
              --account=ABCDE \
              --mx-id=01234567-89AB-CDEF-GHIJ-KLMNOPQRSTUV \
              --amount=12.3456 \
              --email=abc@def.com
```
