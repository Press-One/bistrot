FROM node:alpine

LABEL org.opencontainers.image.title=@LeaskH

RUN apk add --no-cache make g++ git python3 \
    && npm config set user 0 \
    && npm config set unsafe-perm true \
    && npm install -g prs-atm \
    && apk del make g++ git python3
