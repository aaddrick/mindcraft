FROM node:latest

# Install Python and pip
RUN apt-get update && apt-get install -y python3 python3-pip

# Install Python requirements if you have a requirements.txt
COPY requirements.txt .
RUN pip3 install -r requirements.txt

# Copy app files
COPY . .

ENV NODE_ENV=docker

CMD ["node", "main.js"]
