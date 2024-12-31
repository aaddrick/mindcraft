FROM node:latest

# Install Python and pip
RUN apt-get update && apt-get install -y python3 python3-pip python3-venv

# Create and activate a virtual environment
RUN python3 -m venv /app/venv
ENV PATH="/app/venv/bin:$PATH"

# Install Python dependencies for SentenceTransformer
RUN /app/venv/bin/python3 -m pip install --upgrade pip && \
    /app/venv/bin/python3 -m pip install torch sentence-transformers

# Copy app files
COPY . .

ENV NODE_ENV=docker

CMD ["node", "main.js"]
