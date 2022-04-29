FROM python:3.9-buster

WORKDIR /app
COPY spider spider/
COPY setup.cfg setup.py pyproject.toml ./
RUN pip install .

WORKDIR /data

CMD ["/bin/bash"]
