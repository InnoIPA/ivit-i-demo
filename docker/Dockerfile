FROM xilinx/kria-runtime

USER root
ENV WS=/workspace \
    DEBIAN_FRONTEND=noninteractive \
    TIMEZONE=Asia/Taipeia

# Setting TimeZone
RUN apt-get -yq update && \
    apt-get -yq install tzdata && \
    ln -fs /usr/share/zoneinfo/${TIMEZONE} /etc/localtime && \
    dpkg-reconfigure -f noninteractive tzdata

WORKDIR /workspace

# Basic Package
RUN apt-get update -q && \
    apt-get install -qqy boxes tree jq bsdmainutils vim zip && \
    apt-get install -qqy python3-dev python3-pip python3-numpy

# Python 
RUN pip3 install \
    flasgger==0.9.5 \
    Flask==2.0.3 \
    Flask-Cors==3.0.10 \
    Flask-SocketIO==5.1.1 \
    Flask-SQLAlchemy==2.5.1 \
    futures==2.2.0 \
    gunicorn==20.1.0 \
    gevent==21.12.0 \
    idna==3.3 \
    itsdangerous==2.0.1 \
    Jinja2==3.0.3 \
    jsonschema==3.2.0 \
    MarkupSafe==2.0.1 \
    mistune==2.0.2 \
    pyrsistent==0.18.0 \
    python-dateutil==2.8.2 \
    python-engineio==4.3.1 \
    python-slugify==6.1.1 \
    python-socketio==5.5.2 \
    PyYAML==6.0 \
    requests==2.27.1 \
    SQLAlchemy==1.4.35 \
    text-unidecode==1.3 \
    tqdm==4.63.0 \
    typing_extensions==4.1.1 \
    urllib3==1.26.9 \
    websocket-client==1.3.1 \
    Werkzeug==2.0.3 \
    zipp==3.6.0

# Remove Caches
# rm -rf /var/lib/apt/lists/*
# apt-get clean

ENTRYPOINT [ "/bin/bash", "-c" ]
