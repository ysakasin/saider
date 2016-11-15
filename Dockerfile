FROM mhart/alpine-node:latest

RUN adduser -S app
ENV HOME=/home/app

USER app
WORKDIR $HOME/saider
