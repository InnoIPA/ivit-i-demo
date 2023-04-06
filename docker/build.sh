#!/bin/bash

# Basic Parameters
CONF="ivit-i.json"
DOCKER_USER="maxchanginnodisk"
DOCKER_FILE="./docker/Dockerfile"

# Store the utilities
FILE=$(realpath "$0")
ROOT=$(dirname "${FILE}")
source "${ROOT}/utils.sh"

# Parse information from configuration
check_jq
BASE_NAME=$(cat ${CONF} | jq -r '.project')
VERSION=$(cat ${CONF} | jq -r '.version')

if [[ ! -z "${1}" ]];then
    printd "Detect specific platform: ${1}" R
    VERSION="${VERSION}-${1}"
    DOCKER_FILE="${DOCKER_FILE}-${1}"
fi

# Concate name
IMAGE_NAME="${DOCKER_USER}/${BASE_NAME}:${VERSION}"
printd "Concatenate docker image name: ${IMAGE_NAME}" Cy

# Unpack ZIP file
VENDOR_ZIP=$(ls static/vendor 2>/dev/null)
if [[ -z "${VENDOR_ZIP}" ]];then
    printd "Extract vendor library ( vendor.zip )"
    unzip static/vendor.zip
fi

# Build the docker image
# cd "${ROOT}" || exit
printd "Build the docker image... (${IMAGE_NAME})" Cy;

docker build -f docker/Dockerfile \
--build-arg DOCKER_TAG=$VERSION \
-t "${IMAGE_NAME}" -f "${DOCKER_FILE}" .

# Check Docker Image
docker run --rm "${IMAGE_NAME}" echo ""
exit
