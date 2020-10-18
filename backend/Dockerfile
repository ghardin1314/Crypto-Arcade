FROM ubuntu:20.04

WORKDIR /usr/src/backend

RUN apt-get update
RUN apt-get upgrade -y
RUN apt install python3 python3-pip ipython3 netcat -y 

# set environment variables
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

# install dependencies
RUN pip3 install --upgrade pip
# copy project
COPY . /usr/src/backend/
RUN pip3 install -r requirements.txt

RUN chmod +x /usr/src/backend/entrypoint.sh

ENTRYPOINT [ "/usr/src/backend/entrypoint.sh" ]
