# Bistrot

A CLI client and also an API library for [RumSystem.net](https://RumSystem.net).

![banner](https://github.com/Press-One/bistrot/blob/master/wiki/banner.jpg?raw=true "banner")

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
Error: Cannot find module 'sushitrain'
Require stack:
- /data/xuxu/Leask/bistrot/lib/config.js
- /data/xuxu/Leask/bistrot/lib/sushitrain.js
- /data/xuxu/Leask/bistrot/lib/account.js
- /data/xuxu/Leask/bistrot/main.js
- /data/xuxu/Leask/bistrot/index.js
- /data/xuxu/Leask/bistrot/bin/bistrot.js
    at Function.Module._resolveFilename (node:internal/modules/cjs/loader:927:15)
    at Function.Module._load (node:internal/modules/cjs/loader:772:27)
    at Module.require (node:internal/modules/cjs/loader:999:19)
    at require (node:internal/modules/cjs/helpers:93:18)
    at Object.<anonymous> (/data/xuxu/Leask/bistrot/lib/config.js:30:31)
    at Module._compile (node:internal/modules/cjs/loader:1095:14)
    at Object.Module._extensions..js (node:internal/modules/cjs/loader:1124:10)
    at Module.load (node:internal/modules/cjs/loader:975:32)
    at Function.Module._load (node:internal/modules/cjs/loader:816:12)
    at Module.require (node:internal/modules/cjs/loader:999:19)
    at require (node:internal/modules/cjs/helpers:93:18)
    at Object.<anonymous> (/data/xuxu/Leask/bistrot/lib/sushitrain.js:252:16)
    at Module._compile (node:internal/modules/cjs/loader:1095:14)
    at Object.Module._extensions..js (node:internal/modules/cjs/loader:1124:10)
    at Module.load (node:internal/modules/cjs/loader:975:32)
    at Function.Module._load (node:internal/modules/cjs/loader:816:12) {
  code: 'MODULE_NOT_FOUND',
  requireStack: [
    '/data/xuxu/Leask/bistrot/lib/config.js',
    '/data/xuxu/Leask/bistrot/lib/sushitrain.js',
    '/data/xuxu/Leask/bistrot/lib/account.js',
    '/data/xuxu/Leask/bistrot/main.js',
    '/data/xuxu/Leask/bistrot/index.js',
    '/data/xuxu/Leask/bistrot/bin/bistrot.js'
  ]
}
