#!/bin/sh

docker build --no-cache . -t pressone/prs-atm \
&& docker push pressone/prs-atm

docker build --no-cache . -t dockerhub.qingcloud.com/pressone/prs-atm \
&& docker push dockerhub.qingcloud.com/pressone/prs-atm
