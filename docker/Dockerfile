FROM ubuntu:focal

USER root
ENV WS=/workspace
WORKDIR /workspace
COPY ["./py-requirements.txt", "${WS}/" ]

ENV DEBIAN_FRONTEND noninteractive  

RUN apt-get update \
    && apt-get -y install python3-dev python3-pip \
    && apt-get install boxes tree jq bsdmainutils -yq \
    && pip3 install -r py-requirements.txt \
    && rm -rf /var/lib/apt/lists/*

ENTRYPOINT [ "/bin/bash", "-c" ]
