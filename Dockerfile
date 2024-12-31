FROM node:latest

# Install system dependencies
RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    g++ \
    make

# Verify Python installation
RUN python3 --version && which python3

# Install Python dependencies with verbose output
RUN pip3 install --no-cache-dir --verbose torch && \
    pip3 install --no-cache-dir --verbose sentence-transformers

# Verify package installation
RUN python3 -c "import torch; print(torch.__version__)" && \
    python3 -c "from sentence_transformers import SentenceTransformer; print('SentenceTransformers installed')"

# Copy app files
COPY . .

ENV NODE_ENV=docker

CMD ["node", "main.js"]
