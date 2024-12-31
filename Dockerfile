FROM node:latest

# Install Python and pip
RUN apt-get update && apt-get install -y python3 python3-pip

# Install Python dependencies for SentenceTransformer
RUN pip3 install torch sentence-transformers

# Copy app files
COPY . .

ENV NODE_ENV=docker

CMD ["node", "main.js"]
