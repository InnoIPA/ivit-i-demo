# init-i-demo
a web demo site for init-i

# Requirements
* Install [docker](https://max-c.notion.site/Install-Docker-9a0927c9b8aa4455b66548843246152f)

# How to work
* Download the repository
    ```bash
    # Donwload repo and install python package
    $ git clone https://github.com/InnoIPA/init-i-demo.git && cd init-i-demo
    # Extract the library
    $ unzip static/vendor.zip
    ```
* Build the docker image
    ```bash
    $ ./docker/build.sh
    ```
* Run the docker container
    ```bash
    # More detial: docker/run.sh -h
    # ---
    # Without start the web demo
    $ ./docker/run.sh
    # ---
    # Start with web demo ( <host>:4999 )
    # docker/run.sh -f <framewokr: [nvidia, intel]>
    $ ./docker/run.sh -f nv
    ```

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
