FROM node:alpine

LABEL org.opencontainers.image.title=@LeaskH

# RUN apk add --no-cache make g++ git python3 iputils \
#     && npm config set user 0 \
#     && npm config set unsafe-perm true \
#     && npm install -g bistrot \
#     && apk del make g++ git python3

RUN apk add --no-cache iputils \
    && npm install -g bistrot
