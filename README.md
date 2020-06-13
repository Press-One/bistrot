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
```
