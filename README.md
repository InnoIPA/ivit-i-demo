# init-i-demo
a web demo site for init-i

# Requirements

Prepare virtualenv for web service

```bash
# install pip
sudo apt-get install python3-pip
# install virtualenv
sudo pip3 install virtualenv
mkdir ~/.virtualenvs
# install virtualenvwrapper
sudo pip3 install virtualenvwrapper
# add the line below to ~/.bashrc !!!
# please add the line below to ~/.bashrc !!!
# in the ~/.bash not execute them !!!
export WORKON_HOME=~/.virtualenvs
export VIRTUALENVWRAPPER_PYTHON=/usr/bin/python3
. /usr/local/bin/virtualenvwrapper.sh
# restore configuration
source ~/.bashrc
# create a environment and work on it
mkvirtualenv init-i
workon init-i

# Donwload repo and install python package
$ git clone https://github.com/InnoIPA/init-i-demo.git && cd init-i-demo
$ pip3 install -r requirements.txt

# uncompress the library
$ unzip static/vendor.zip
```

# Run
```shell
$ ./demo.sh -f trt

[2022-04-26 15:07:44 +0800] [7300] [INFO] Starting gunicorn 20.1.0
[2022-04-26 15:07:44 +0800] [7300] [INFO] Listening at: http://0.0.0.0:4999 (7300)
[2022-04-26 15:07:44 +0800] [7300] [INFO] Using worker: eventlet
[2022-04-26 15:07:44 +0800] [7303] [INFO] Booting worker with pid: 7303
```
* `-f` could change the framework.
* `-h` to see more detail.

# Features
1. Entrance
   1. Capture the application list when loading the page
   2. Add an application
   3. Edit the application
   4. Delete the application
   5. Enter the stream page
2. Stream
   1. Capture GPU temperature every 5 seconds
   2. Receive image and result from backend via socketio
3. Add / Edit
   1. Enter `Application Name`
   2. Select `Category` and `Application` ( only in Add mode )
   3. Select `Input Type` and Enter `Input Source`
   4. Select `Device` ( only in Add mode )
   5. Choose the threshold

# Figures
* Entrance
    ![img](./assests/dashboard.png)

* Stream
    ![img](./assests/stream.png)

* Add 
    ![img](./assests/add.png)

* Edit
    ![img](./assests/edit.png)
