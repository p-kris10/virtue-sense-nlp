FROM python:3.10-slim-buster
WORKDIR /app
COPY ./requirements.txt /app
RUN apt-get update && apt-get install -y git
RUN pip install -r requirements.txt
RUN apt-get -y update
RUN apt-get install -y ffmpeg
COPY . .
EXPOSE 5000
ENV FLASK_APP=my_app.py
CMD ["flask", "run", "--host", "0.0.0.0"]