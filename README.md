# ivit-i-demo
The web demo site for ivit-i

* [Requirements](#requirements)
* [How to work](#how-to-work)
* [Demo](#demo)

# Requirements
* Install [docker](https://max-c.notion.site/Install-Docker-9a0927c9b8aa4455b66548843246152f)

# How to work
1. Download the repository
    ```bash
    # Donwload repo and install python package
    $ git clone https://github.com/InnoIPA/ivit-i-demo.git && cd ivit-i-demo
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
        ![image](docs/imagesimages/ivit-i-demo-ip.png)

    * Modify Config and Run
        * Modify Config
            ```JSON
            {
                "server":{
                    "ip": "172.16.92.130",
                    "platform": "intel",
                    "port": "819"
                },
                "client":{
                    "docker_image": "ivit-i-demo",
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
# Demo
> The image and video with high resolution in [my notion page](https://max-c.notion.site/iVIT-I-DEMO-v0-4-20592c5e3c11415e97540d0b72c5b706)
<details>
    <summary>
        Entrance
    </summary>
    <img src="./docs/imagesimages/entrace.png">
</details>

<details>
    <summary>
        Add Event
    </summary>
    <img src="./docs/imagesimages/add-modal.gif">
</details>
<details>
    <summary>
        Edit and Delete Event
    </summary>
    <img src="./docs/imagesimages/edit-del-modal.gif">
</details>
<details>
    <summary>
        Import Event
    </summary>
    <img src="./docs/imagesimages/import-modal.gif">
</details>
<details>
    <summary>
        Run AI Task
    </summary>
    <img src="./docs/imagesimages/run-task.gif">
</details>
<details>
    <summary>
        Stream Page
    </summary>
    <img src="./docs/imagesimages/stream.gif">
</details>
<details>
    <summary>
        Application
    </summary>
    <img src="./docs/imagesimages/application.gif">
</details>
<details>
    <summary>
        Application Result
    </summary>
    <img src="./docs/imagesimages/application-result.gif">
</details>