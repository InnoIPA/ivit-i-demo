FROM ubuntu:focal

USER root
ENV WS=/workspace
WORKDIR /workspace
COPY [ "./requirements.sh", "./utils.sh", "./py-requirements.txt", "./" ]

ENV DEBIAN_FRONTEND=noninteractive  

RUN ./requirements.sh

ENTRYPOINT [ "/bin/bash", "-c" ]
