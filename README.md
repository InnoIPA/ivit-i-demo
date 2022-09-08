![LOGO](docs/images/iVIT-I-Logo-B.png)

# ivit-i-web-ui
The web demo site for ivit-i

* [Requirements](#requirements)
* [How to work](#how-to-work)
* [Demo](#demo)

# Requirements
* Install [docker](https://max-c.notion.site/Install-Docker-9a0927c9b8aa4455b66548843246152f)

# How to work

* From Docker Hub
    ```bash
    IVIT_SERVER_IP="172.16.92.130"
    IVIT_SERVER_PORT="818"
    
    docker run --name ivit-i-web-ui \
    --rm -it \
    --net=host --ipc=host \
    maxchanginnodisk/ivit-i-web-ui:v1.0 \
    "./demo.sh -i ${IVIT_SERVER_IP} -p ${IVIT_SERVER_PORT}"
    ```

* Build From Source
    1. Download the repository
        ```bash
        # Donwload repo and install python package
        $ git clone https://github.com/InnoIPA/ivit-i-web-ui.git && cd ivit-i-web-ui
        ```
    2. Build the docker image
        ```bash
        $ ./docker/build.sh
        ```
    3. Run the docker container
        * Run With Command Line
            ```bash
            $ ./docker/run.sh -b intel -i 172.16.92.130 -p 819
            ```
            ![image](docs/images/iVIT-I-IP.png)

        * Modify Config and Run
            * Modify Config
                ```JSON
                {
                    "project": "ivit-i-web-ui",
                    "version": "v1.0",
                    "server": {
                        "ip": "172.16.92.130",
                        "port": "818"
                    },
                    "client": {
                        "docker_image": "ivit-i-web-ui",
                        "ip": "0.0.0.0",
                        "port": "4999"
                    }
                }
                ```
                * Server: fill with the IP Address of `ivit-i-<platform>`
                * Client: shows the information of `Demo Site`
            * Run
                ```bash
                ./docker/run.sh
                ```

                |   Argument    |   Describe    
                |   ---         |   ---
                |   -i          |   server ip
                |   -p          |   server port
                
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