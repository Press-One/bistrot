#!/bin/sh

cat template.md > README.md
echo '\n```' >> README.md
./bin/prs-atm.js >> README.md
echo '```' >> README.md
