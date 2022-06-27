#!/bin/bash
set -e

if [ "$BRANCH" = "dev" ]; then
    export TTOS_SERVICE_NAME=ttos-frontend-dev.service
    export SERVER_PATH=/home/ubuntu/TTOS-FRONTEND-DEV/tabletop-ordering-system
elif [ "$BRANCH" = "staging" ]; then
    export TTOS_SERVICE_NAME=ttos-frontend-staging.service
    export SERVER_PATH=/home/ubuntu/TTOS-FRONTEND-STAGING/tabletop-ordering-system
elif [ "$BRANCH" = "master" ]; then
    export TTOS_SERVICE_NAME=ttos-frontend-production.service
    export SERVER_PATH=/home/ubuntu/TTOS-FRONTEND-PROD/tabletop-ordering-system
fi

echo "*************************************"
echo "Stop the server"
sudo systemctl stop $TTOS_SERVICE_NAME
echo "*************************************"
echo "Go to Server Directory"
cd $SERVER_PATH
echo "*************************************"
echo "Git Pull From $BRANCH branch"
git pull
echo "*************************************"
echo "Install Dependency"
npm install
if [[ "$BRANCH" = "master" ||  "$BRANCH" = "staging" ]]; then
	echo "Execute NPM RUN BUILD"
        sudo npm run build
else
	echo "No need to run npm run build. Dev Branch Trigger"
fi
echo "*************************************"
echo "Start The Server"
sudo systemctl start $TTOS_SERVICE_NAME
echo "*************************************"
echo "Finish"
echo "*************************************"

