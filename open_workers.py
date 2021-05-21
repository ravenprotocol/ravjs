import os
import tarfile

import docker
from docker.errors import NotFound
from selenium import webdriver
from selenium.webdriver.common.desired_capabilities import DesiredCapabilities

client = docker.from_env()


def copy_to(src, dst):
    name, dst = dst.split(':')
    container = client.containers.get(name)

    os.chdir(os.path.dirname(src))
    srcname = os.path.basename(src)
    tar = tarfile.open(src + '.tar', mode='w')
    try:
        tar.add(srcname)
    finally:
        tar.close()

    data = open(src + '.tar', 'rb').read()
    container.put_archive(os.path.dirname(dst), data)


configs = [
    {
        "name": "ravjs_worker1",
        "port": 4444
    },
    {
        "name": "ravjs_worker2",
        "port": 4445
    },
    {
        "name": "ravjs_worker3",
        "port": 4446
    }
]


def create_workers():
    try:
        c = client.containers.get(container_id=config['name'])
        c.stop()
        c.remove()
        print("Container stopped and removed")
    except NotFound as e:
        print(e)

    c = client.containers.run('selenium/standalone-chrome', name=config['name'], detach=True,
                              ports={'4444/tcp': config['port']}, tty=False)


if __name__ == '__main__':
    for config in configs:
        files = ["worker.html", "raven.js", "math.js", "tf.js", "socket.io-1.2.0.js"]

        for filename in files:
            copy_to(os.path.join(os.getcwd(), filename), "{}:/tmp/{}".format(config['name'], filename))
            os.remove(os.path.join(os.getcwd(), filename + ".tar"))

        driver = webdriver.Remote("http://127.0.0.1:{}/wd/hub".format(config['port']), DesiredCapabilities.CHROME)
        driver.get("file:///tmp/worker.html")

        print("File opened")
