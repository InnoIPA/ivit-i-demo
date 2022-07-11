#!/bin/bash
ROOT=$(dirname `realpath $0`)
source "${ROOT}/utils.sh"

# Concate name
IMAGE_NAME="ivit-i-demo"
printd "Concatenate docker image name: ${IMAGE_NAME}" Cy

# Build the docker image
cd $ROOT
printd "Build the docker image. (${IMAGE_NAME})" Cy
docker build -t ${IMAGE_NAME} .