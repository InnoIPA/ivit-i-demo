#!/bin/bash
ROOT=$(dirname `realpath $0`)
source "${ROOT}/utils.sh"

# Concate name
DOCKER_IMAGE=$(cat ${CONF} | jq -r '.client.docker_image')
printd "Concatenate docker image name: ${DOCKER_IMAGE}" Cy

# Unpack ZIP file
if [[ -z `ls static/vendor 2>/dev/null` ]];then
    printd "Extract vendor library ( vendor.zip )"
    unzip static/vendor.zip
fi

# Build the docker image
cd ${ROOT};
printd "Build the docker image. (${DOCKER_IMAGE})" Cy;
docker build -t ${DOCKER_IMAGE} .