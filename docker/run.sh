#!/bin/bash

# Basic Parameters
CONF="ivit-i.json"
DOCKER_USER="maxchanginnodisk"

# Store the utilities
FILE=$(realpath "$0")
ROOT=$(dirname "${FILE}")
source "${ROOT}/utils.sh"

# Install pre-requirement
check_jq

# Define the configuration path
CONF="ivit-i.json"
RUN_CMD="./demo.sh"
WORKSPACE="/workspace"
C_PORT=""
RUN_MODE="-it"

# Read the config at first time
IP=$(cat ${CONF} | jq -r '.server.ip')
PORT=$(cat ${CONF} | jq -r '.server.port')

# Help information
function help(){
	echo "Run the iVIT-I-DEMO environment."
	echo
	echo "Syntax: scriptTemplate [-f|b|i|p|d]"
	echo "options:"
	# echo "b		brand or platform"   
    echo "i		ip"
    echo "p		port"
	echo "d		detech, run in background"
	echo "h		help."
}

# Parse the argument
while getopts "b:i:p:c:dh" option; do
	case $option in
		i )
			IP=$OPTARG ;;
        p )
			PORT=$OPTARG ;;
		c )
			C_PORT=$OPTARG ;;
		d )
			RUN_MODE="-d" ;;
        h )
			help; exit ;;
		\? )
			help; exit ;;
		* )
			help; exit ;;
	esac
done

# Update the parameters of configuration
RUN_CMD="${RUN_CMD} -i ${IP} -p ${PORT}"
if [[ ${C_PORT} != "" ]]; then RUN_CMD="${RUN_CMD} -c ${C_PORT}"; fi

# Parse information from configuration
BASE_NAME=$(cat ${CONF} | jq -r '.project')
TAG_VER=$(cat ${CONF} | jq -r '.version')

# Concate name
IMAGE_NAME="${DOCKER_USER}/${BASE_NAME}:${TAG_VER}"
CONTAINER_NAME="${BASE_NAME}-${TAG_VER}"

# Allow all device connect to display
# xhost + > /dev/null 2>&1

# Combine the docker command
DOCKER_CMD="docker run \n\
--name ${CONTAINER_NAME} \n\
--rm \n\
${RUN_MODE} \n\
--net=host --ipc=host \n\
-w ${WORKSPACE} \n\
-v $(pwd):${WORKSPACE} \n\
${IMAGE_NAME} \n\
'${RUN_CMD}'"

# Show Log
printd "Docker Command:\n${DOCKER_CMD}\n" Cy
DOCKER_CMD="${DOCKER_CMD//\\n/}"

# Run docker container
printd "Start up docker container ..."
bash -c "${DOCKER_CMD}"