#!/bin/bash
ROOT=$(dirname $(realpath $0))
source "${ROOT}/utils.sh"

USER="maxchanginnodisk"
GITHUB_USER="MaxChangInnodisk"
GITHUB_TOKEN="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"

# Define configuration path
CONF="ivit-i.json"

# Check JSON file
FLAG=$(ls ${CONF} 2>/dev/null)
if [[ -z $FLAG ]];then
    CONF="${RUN_PWD}/${CONF}"
    FLAG=$(ls ${CONF} 2>/dev/null)
    if [[ -z $FLAG ]];then
        echo "Couldn't find configuration (${CONF})"; exit
    fi
fi
printd "Get configuration file: ${CONF}"

# Install pre-requirement
check_jq

# Parse information from configuration
BASE_NAME=$(cat ${CONF} | jq -r '.project')
TAG_VER=$(cat ${CONF} | jq -r '.version')

# Concate name
IMAGE_NAME="${USER}/${BASE_NAME}:${TAG_VER}"
printd "Concatenate docker image name: ${IMAGE_NAME}" Cy

# Build Docker Image
docker build -t "${IMAGE_NAME}" \
--build-arg "VER=${TAG_VER//v/r}" \
--build-arg "GITHUB_USER=${GITHUB_USER}" \
--build-arg "GITHUB_TOKEN=${GITHUB_TOKEN}" \
-f "${ROOT}/DockerfileRelease" . 