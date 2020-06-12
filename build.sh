#!/bin/sh

npm version patch \
&& npm upgrade utilitas \
&& git commit -am 'npm upgrade utilitas' \
&& git pull \
&& git push \
&& npm publish
