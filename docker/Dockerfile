FROM ubuntu:focal

USER root
ENV WS=/workspace
WORKDIR /workspace
COPY [ "requirements.sh", "./py-requirements.txt", "${WS}/" ]

ENV DEBIAN_FRONTEND noninteractive  

RUN ./requirements.sh

ENTRYPOINT [ "/bin/bash", "-c" ]
