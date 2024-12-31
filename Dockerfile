FROM node:latest

# Install system dependencies
RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    g++ \
    make

# Install Python dependencies with verbose output
RUN pip3 install --no-cache-dir --verbose torch sentence-transformers

# Copy app files
COPY . .

ENV NODE_ENV=docker

CMD ["node", "main.js"]
