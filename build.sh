#!/bin/sh

npm version patch \
&& npm upgrade utilitas \
&& ( git commit -am 'npm upgrade utilitas' || true ) \
&& git pull \
&& git push \
&& npm publish
