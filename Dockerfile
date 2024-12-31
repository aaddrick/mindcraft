FROM node:latest

# Install system dependencies
RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    g++ \
    make

# Verify Python installation
RUN python3 --version && which python3

# Install Python dependencies globally with verbose output
RUN pip3 install --no-cache-dir --verbose torch && \
    pip3 install --no-cache-dir --verbose sentence-transformers

# Verify the installation
RUN python3 -c "import torch; print(torch.__version__)" && \
    python3 -c "from sentence_transformers import SentenceTransformer; print('SentenceTransformers installed')"

# Add debugging steps
RUN which python3 && which pip3
RUN ls -la /app

# Ensure no virtual environment is used
ENV PYTHON_VENV=no

# Copy app files
COPY . .

ENV NODE_ENV=docker

CMD ["node", "main.js"]
