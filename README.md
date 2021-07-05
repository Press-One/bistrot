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
$ docker pull dockerhub.qingcloud.com/pressone/prs-atm
$ docker run -it --rm dockerhub.qingcloud.com/pressone/prs-atm prs-atm help
```

*Important: If you want to use a keystore file with the docker version, be sure to mount the path to the keystore file.*

## Instruction
