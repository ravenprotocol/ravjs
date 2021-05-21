FROM selenium/standalone-chrome

COPY . /
RUN apt-get update
RUN apt-get install python3-pip
RUN pip3 install selenium

CMD ["python3", "start_worker.py"]
