![LOGO](docs/images/iVIT-I-Logo-B.png)

# ivit-i-web-ui
The web demo site for ivit-i

* [Requirements](#requirements)
* [How to work](#how-to-work)
* [Demo](#demo)

# Requirements
* [Docker](https://max-c.notion.site/Install-Docker-9a0927c9b8aa4455b66548843246152f)
* One of the "iVIT-I" platforms that has been launched
    
    > __NOTICE:__
    > 
    > __make sure the release version is the same, e.g. `ivit-i-web-ui:v1.0` bind to `ivit-i-intel:v1.0` .*__

    * [ivit-i-intel](https://github.com/InnoIPA/ivit-i-intel/)
    * [ivit-i-nvidia](https://github.com/InnoIPA/ivit-i-nvidia/)
    * [ivit-i-xilinx](https://github.com/InnoIPA/ivit-i-xilinx/)

# Usage
1. Run with docker command
    ```bash
    sudo docker run --name ivit-i-web-ui --rm -it \
    --net=host \
    maxchanginnodisk/ivit-i-web-ui:v1.1
    ```
2. Mount custom config
    ```bash
    sudo docker run --name ivit-i-web-ui --rm -it \
    --net=host \
    -v $(pwd)/custom.json:/workspace/ivit-i.json \
    maxchanginnodisk/ivit-i-web-ui:v1.1
    ```

# Configuration for User ( [ivit-i.json](/ivit-i.json) )
|   Parameters        |   Default       |   Description
|   ---               |   ---           |   ---
|   workers           |   1             |   Set up gunicorn worker
|   threads           |   10            |   Set up the maxmium threads
|   web_port          |   4999          |   Set up demo site port 
|   nginx_port        |   6532          |   Set up nginx port 

# Demo

<details>
    <summary>
        Entrance
    </summary>
    <img src="./docs/images/iVIT-I-Entrance.png">
</details>

<details>
    <summary>
        Add Event
    </summary>
    <img src="./docs/images/iVIT-I-Add.png">
</details>
<details>
    <summary>
        Edit and Delete Event
    </summary>
    <img src="./docs/images/iVIT-I-Edit.png">
</details>
<details>
    <summary>
        Import Event
    </summary>
    <img src="./docs/images/iVIT-I-Import-ZIP.png">
    <img src="./docs/images/iVIT-I-Import-URL.png">
</details>
<details>
    <summary>
        Application
    </summary>
    <img src="./docs/images/iVIT-I-App-Search.png">
    <img src="./docs/images/iVIT-I-App-Area.png">
</details>
<details>
    <summary>
        Stream Page
    </summary>
    <img src="./docs/images/iVIT-I-Stream.png">
</details>
<br>

# Development

* Build docker image
    ```bash
    ./docker/build.sh
    ```
* Run docker image which will mount whole project item into `/workspace`
    ```bash
    ./docker/run.sh

    # if need running at background, run `./docker/run.sh -b`
    ```
* Development parameters in configuration ( [ivit-i.json](/ivit-i.json) )
    |   Parameters        |   Default       |   Description
    |   ---               |   ---           |   ---
    |   project           |   ivit-i-web-ui |   Set up the docker image name
    |   version           |                 |   Set up the version
        
 

# Structure

* `docker/`
    * `build.sh`: build docker image.
    * `Dockerfile`: the building workflow of docker image.
    * `entrypoint`: define docker entrypoint.
    * `ivit-logo`: print ivit logo after enter docker container.
    * `run.sh`: run docker container and mount whole project into it.
    * `utils.sh`: some utilities for `build.sh` and `run.sh`.
* `docs/` : place document and figures
* `static/` : the demo site script
* `vendor/` : third party
* `vendor.zip` : git track the vendor with zip file not folder, because github not support too many file at once.
* `templates/` : place the html file
* `tools`: some utilities for develop
* `app.py`: the entrance of flask
* `launch-demo-site`: launch flask via gunicorn
* `package_vendor`: compress the vendor folder because github could not upload too many files.
* `README.md`: user guide
* `ivit-i.json`: configuration