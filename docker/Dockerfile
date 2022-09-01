FROM ubuntu:focal

WORKDIR /workspace
COPY ["./py-requirements.txt", "/workspace/" ]
USER root

# 由於 安裝套件有互動界面會導致報錯 所以先行關閉
ENV DEBIAN_FRONTEND noninteractive  
RUN apt-get update \
&& apt-get -y install python3-dev python3-pip \
&& apt-get install boxes tree jq bsdmainutils -yq

RUN pip3 install -r py-requirements.txt

ENTRYPOINT [ "/bin/bash", "-c" ]
