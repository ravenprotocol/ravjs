import argparse
import os
import tarfile

import docker
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


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description='Create workers')
    parser.add_argument('-n', '--name', type=str, help="Name of the worker")
    parser.add_argument('-H', '--host', type=str, help='Cluster host url')
    parser.add_argument('-p', '--port', type=int, help='Worker port')

    args = parser.parse_args()

    files = ["worker.html", "raven.js", "math.js", "tf.js", "socket.io-1.2.0.js"]

    for filename in files:
        copy_to(os.path.join(os.getcwd(), filename), "{}:/tmp/{}".format(args.name, filename))
        os.remove(os.path.join(os.getcwd(), filename + ".tar"))

    driver = webdriver.Remote("http://{}:{}/wd/hub".format(args.host, args.port), DesiredCapabilities.CHROME)
    driver.get("file:///tmp/worker.html")

    print("Worker '{}' started:{}:{}".format(args.name, args.host, args.port))
