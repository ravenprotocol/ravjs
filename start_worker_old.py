import os

from selenium import webdriver
from selenium.webdriver.chrome.options import Options
import pathlib

print(os.getcwd())

CHROMEDRIVER_PATH = os.path.join(pathlib.Path(__file__).parent.absolute(), "chromedriver")
# CHROMEDRIVER_PATH = os.path.join("/usr/local/bin", "chromedriver")

options = Options()
options.headless = True
driver = webdriver.Chrome(CHROMEDRIVER_PATH, options=options)

driver.get("file://{}/worker.html".format(os.getcwd()))

driver.close()
