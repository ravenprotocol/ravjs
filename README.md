# ravjs
Raven Distribution Framework's Javascript Library

Set RAVSOCK_SERVER_URL to your server url in the raven.js file

Requirements
1. Docker
2. Selenium

Using 'selenium/standalone-chrome:4.0.0-beta-4-prerelease-20210517' docker image
https://github.com/SeleniumHQ/docker-selenium

#### Install dependencies

    pip3 install -r requirements.txt
    
#### Now create a cluster of workers by executing a single command:

    sh create_local_cluster.sh 5   # Specify the number of workers to create
    
Note: change RAVSOCK_SERVER_URL to "host.docker.internal" in the raven.js file 


## Manually

Start 3 workers with the help of following commands

#### Start containers

    sh start_containers.sh
    
#### Open workers

    python3 open_workers.py
    
#### Access workers for debugging purposes
    
    http://127.0.0.1:7901  # Password: secret
    http://127.0.0.1:7902  # Password: secret
    http://127.0.0.1:7903  # Password: secret
    http://127.0.0.1:7904  # Password: secret
    http://127.0.0.1:7905  # Password: secret
