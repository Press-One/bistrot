#!/bin/sh

npm version patch \
&& git pull \
&& git push \
&& npm publish
