#!/bin/bash

SERVER=( 'api.resrvo.com' )
DEPLOY_PATH=/var/app/resrvo
REPO=git@github.com:wired8/resrvo.git
USER=deploy

ENVIRONMENT=${1:-"production"}
REF=${2:-"master"}

trap 'test -n "$SUCCESS" || echo "  error: aborted"' EXIT
echo "* Deploying $ENVIRONMENT/$REF"

ssh $USER@$SERVER "cd $DEPLOY_PATH && \
                   git reset --hard && \
                   git checkout $REF && \
                   git pull && \
                   npm install && \
                   /etc/init.d/resrvo stop"

SUCCESS=true
