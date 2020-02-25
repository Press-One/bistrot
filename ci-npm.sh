#!/bin/sh

npm version patch && ./ci-readme.sh && npm publish && git pull && git push
