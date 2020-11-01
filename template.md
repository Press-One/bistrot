# PRS-ATM

A CLI client for [PRESS.one](https://press.one/) .

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
