#!/bin/bash
ROOT=$(dirname $(realpath $0))
source "${ROOT}/utils.sh"

# Install pre-requirement
if [[ -z $(which jq) ]];then
    printd "Installing requirements .... " Cy
    sudo apt-get install jq -yqq
fi

# Define the configuration path
CONF="ivit-i.json"
RUN_CMD="./demo.sh"
WORKSPACE="/workspace"

# Read the config at first time
IP=$(cat ${CONF} | jq -r '.server.ip')
PORT=$(cat ${CONF} | jq -r '.server.port')

# Help information
function help(){
	echo "Run the iVIT-I-DEMO environment."
	echo
	echo "Syntax: scriptTemplate [-f|b|i|p]"
	echo "options:"
	# echo "b		brand or platform"   
    echo "i		ip"
    echo "p		port"
	echo "h		help."
}

# Parse the argument
while getopts "b:i:p:h" option; do
	case $option in
		i )
			IP=$OPTARG ;;
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

# Update the parameters of configuration
CNT=$(jq \
--arg ip "${IP}" --arg port "${PORT}" \
'.server.ip = $ip | .server.port = $port' \
${CONF})

echo -E "${CNT}" > ${CONF}

# setup parameters
DOCKER_IMAGE=$(cat ${CONF} | jq -r '.client.docker_image')
DOCKER_NAME=${DOCKER_IMAGE}
PORT=$(cat ${CONF} | jq -r '.client.port')
IP=$(cat ${CONF} | jq -r '.client.ip')

# Allow all device connect to display
xhost + > /dev/null 2>&1

# Combine the docker command
DOCKER_CMD="docker run \
--name ${DOCKER_NAME} \
--rm -it \
--net=host --ipc=host \
-w ${WORKSPACE} \
-v `pwd`:${WORKSPACE} \
${DOCKER_IMAGE} \"${RUN_CMD}\""

# Show 
echo ${DOCKER_CMD}
printd ${DOCKER_CMD}

# Run docker container
bash -c "${DOCKER_CMD}"