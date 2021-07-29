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
ReferenceError: transfer is not defined
    at Object.<anonymous> (/data/xuxu/Leask/bistrot/lib/finance.js:110:5)
    at Module._compile (node:internal/modules/cjs/loader:1095:14)
    at Object.Module._extensions..js (node:internal/modules/cjs/loader:1124:10)
    at Module.load (node:internal/modules/cjs/loader:975:32)
    at Function.Module._load (node:internal/modules/cjs/loader:816:12)
    at Module.require (node:internal/modules/cjs/loader:999:19)
    at require (node:internal/modules/cjs/helpers:93:18)
    at Object.<anonymous> (/data/xuxu/Leask/bistrot/main.js:19:14)
    at Module._compile (node:internal/modules/cjs/loader:1095:14)
    at Object.Module._extensions..js (node:internal/modules/cjs/loader:1124:10)
    at Module.load (node:internal/modules/cjs/loader:975:32)
    at Function.Module._load (node:internal/modules/cjs/loader:816:12)
    at Module.require (node:internal/modules/cjs/loader:999:19)
    at require (node:internal/modules/cjs/helpers:93:18)
    at Object.<anonymous> (/data/xuxu/Leask/bistrot/index.js:4:22)
    at Module._compile (node:internal/modules/cjs/loader:1095:14)
