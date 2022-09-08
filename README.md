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

# How to work

1. Download the repository
    ```bash
    git clone https://github.com/InnoIPA/ivit-i-web-ui.git && cd ivit-i-web-ui
    ```
2. Build the docker image
    ```bash
    ./docker/build.sh
    ```
3. Run the docker container

    ```bash
    ./docker/run.sh -i 172.16.92.130 -p 819
    ```
    
    |   Argument    |   Describe    
    |   ---         |   ---
    |   -i          |   server ip, which will show up in your device when `ivit-i-{platform}` is started, if not provided, default is the IP Address of `ivit-i-web-ui`
    |   -p          |   server port defined in `ivit-i-{platform}/ivit-i.json`
    |   -c          |   client port, default is `4999`

    ![image](docs/images/iVIT-I-IP.png)
            
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