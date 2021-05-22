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

#### Start containers

    sh start_containers.sh
    
#### Open workers

    python3 open_workers.py
    
#### Access workers for debugging
    
    http://127.0.0.1:7900  # Password: secret
    http://127.0.0.1:7901  # Password: secret
    http://127.0.0.1:7902  # Password: secret
