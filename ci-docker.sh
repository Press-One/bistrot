#!/bin/sh

docker build --no-cache . -t pressone/prs-atm && docker push pressone/prs-atm
