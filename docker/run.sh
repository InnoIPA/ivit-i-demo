#!/bin/bash

# ========================================================
# Basic Parameters
CONF="ivit-i.json"
DOCKER_USER="maxchanginnodisk"

# ========================================================
# Store the utilities
FILE=$(realpath "$0")
ROOT=$(dirname "${FILE}")
source "${ROOT}/utils.sh"

# ========================================================
# Install pre-requirement
check_jq

# ========================================================
# Define the configuration path
CONF="ivit-i.json"
RUN_CMD="launch-demo-site"
BG=false

# Read the config at first time
BASE_NAME=$(cat ${CONF} | jq -r '.project')
VERSION=$(cat ${CONF} | jq -r '.version')
PORT=$(cat ${CONF} | jq -r '.port')

# ========================================================
# Help information
function waitTime(){
	TIME_FLAG=$1
	while [ $TIME_FLAG -gt 0 ]; do
		printf "\rWait ... (${TIME_FLAG}) "; sleep 1
		(( TIME_FLAG-- ))
	done
	printf "\r                 \n"
}

function help(){
	echo "Run the iVIT-I-DEMO environment."
	echo
	echo "Syntax: scriptTemplate [-f|b|p]"
	echo "options:"
	echo "b		background"
	echo "p		port"
	echo "h		help."
}

# Parse the argument
while getopts "p:bh" option; do
	case $option in
		b )
			BG=true ;;
        p )
			PORT=$OPTARG ;;
        h )
			help; exit ;;
		\? )
			help; exit ;;
		* )
			help; exit ;;
	esac
done

# ========================================================
# Combine each parameters
IMAGE_NAME="${DOCKER_USER}/${BASE_NAME}:${VERSION}"
CONTAINER_NAME="${BASE_NAME}-${VERSION}"
RUN_CMD="${RUN_CMD} -p ${PORT}"

if [[ ${BG} = false ]];then
	SET_MODE="-it"
else
	SET_MODE="-dt"
fi
# ========================================================
# Combine the docker command
DOCKER_CMD="docker run \
--name ${CONTAINER_NAME} \
--rm \
${SET_MODE} \
--net=host \
${IMAGE_NAME} \
${RUN_CMD}"

# ========================================================
# Show Log
printd "Please Check Docker Command" Cy
echo -e "\n${DOCKER_CMD}\n"

waitTime 3

# ========================================================
# Run docker container
DOCKER_CMD="${DOCKER_CMD//\\n/}"
printd "Start up docker container ..." R
bash -c "${DOCKER_CMD}"