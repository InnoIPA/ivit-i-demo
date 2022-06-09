FROM ubuntu:focal
# ------------------------------------------------------------------
WORKDIR /workspace
COPY ["./requirements.txt", "/workspace/" ]
USER root
# ------------------------------------------------------------------
# 由於 安裝套件有互動界面會導致報錯 所以先行關閉
ENV DEBIAN_FRONTEND noninteractive  
RUN apt-get update \
&& apt-get -y install python3-pip \
&& pip3 install -r requirements.txt

ENTRYPOINT [ "/bin/bash", "-c" ]
