#!/bin/sh
docker run --rm --name $1 -d -v /var/data/prschain:/opt/eosio/data-dir -p 8888:8888 -p 9876:9876 -p 8080:8080 -t dockerhub.qingcloud.com/pressone/chainsystem:latest nodeosd.sh $@
