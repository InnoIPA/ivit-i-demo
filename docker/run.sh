#!/bin/bash
source "$(dirname $(realpath $0))/utils.sh"

# Install pre-requirement
if [[ -z $(which jq) ]];then
    printd "Installing requirements .... " Cy
    sudo apt-get install jq -yqq
fi

# Define the configuration path
CONF="ivit-i.json"

# setup parameters
DOCKER_IMAGE=$(cat ${CONF} | jq -r '.client.docker_image')
DOCKER_NAME=${DOCKER_IMAGE}
PORT=$(cat ${CONF} | jq -r '.client.port')
IP=$(cat ${CONF} | jq -r '.client.ip')

WORKSPACE="/workspace"
SET_VISION=""
RUN_WEB=true
RUN_CLI=false

WEB_CMD="./demo.sh"
CLI_CMD="bash"
RUN_CMD=${WEB_CMD}

# Help information
function help(){
	echo "Run the iVIT-I-DEMO environment."
	echo
	echo "Syntax: scriptTemplate [-f|wsh]"
	echo "options:"
	echo "c		run container with CLI mode ( Command Line Interface )"
	echo "h		help."
}

# Parse the argument
while getopts "ch" option; do
	case $option in
		c )
			RUN_CLI=true ;;
		h )
			help; exit ;;
		\? )
			help; exit ;;
		* )
			help; exit ;;
	esac
done

# Run CLI mode
if [[ ${RUN_CLI} = true ]];then RUN_CMD=${CLI_CMD}; fi

# Allow all device connect to display
xhost + > /dev/null 2>&1

# Combine the docker command
DOCKER_CMD="docker run \
--name ${DOCKER_NAME} \
--rm -it \
--net=host --ipc=host \
-w ${WORKSPACE} \
-v `pwd`:${WORKSPACE} \
${SET_VISION} \
${DOCKER_IMAGE} \"${RUN_CMD}\""

# Show 
printd ${DOCKER_CMD}

# Run docker container
bash -c "${DOCKER_CMD}"