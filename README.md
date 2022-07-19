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
3. Modify Configuration
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
    
4. Run the docker container
    ```bash
    $ ./docker/run.sh
    
    # Run with CLI mode
    $ ./docker/run.sh -c
    ```
    ![image](assests/ivit-i-demo-ip.png)

# Demo
> The image and video with high resolution in [my notion page](https://max-c.notion.site/iVIT-I-DEMO-v0-4-20592c5e3c11415e97540d0b72c5b706)
<details>
    <summary>
        Entrance
    </summary>
    <img src="./assests/entrace.png">
</details>

<details>
    <summary>
        Add Event
    </summary>
    <img src="./assests/add-modal.gif">
</details>
<details>
    <summary>
        Edit and Delete Event
    </summary>
    <img src="./assests/edit-del-modal.gif">
</details>
<details>
    <summary>
        Import Event
    </summary>
    <img src="./assests/import-modal.gif">
</details>
<details>
    <summary>
        Run AI Task
    </summary>
    <img src="./assests/run-task.gif">
</details>
<details>
    <summary>
        Stream Page
    </summary>
    <img src="./assests/stream.gif">
</details>
<details>
    <summary>
        Application
    </summary>
    <img src="./assests/application.gif">
</details>
<details>
    <summary>
        Application Result
    </summary>
    <img src="./assests/application-result.gif">
</details>