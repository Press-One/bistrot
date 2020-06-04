#!/bin/sh

npm version patch \
&& npm publish \
&& git pull \
&& git push
