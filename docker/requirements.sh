#!/bin/bash

# Get utils function
ROOT=$(dirname $(realpath $0))
source "${ROOT}/utils.sh"

# None interactive mode
HEAD="DEBIAN_FRONTEND=noninteractive"

# Update and Install packages
apt-get update -q
${HEAD} apt-get install -qqy boxes tree jq bsdmainutils vim zip
${HEAD} apt-get install -qqy python3-dev python3-pip

# Install python module
pip3 install -r "${ROOT}/py-requirements.txt"

# Remove Caches
rm -rf /var/lib/apt/lists/*