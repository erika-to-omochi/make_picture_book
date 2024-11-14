FROM node:20.11.0

ENV TZ Asia/Tokyo

RUN apt-get update && apt-get install -y \
    build-essential \
    libcairo2-dev \
    libpango1.0-dev \
    libjpeg-dev \
    libgif-dev \
    librsvg2-dev \
    pkg-config \
    && rm -rf /var/lib/apt/lists/*


WORKDIR /app

COPY package.json yarn.lock /app/
RUN yarn install

COPY . /app

CMD ["yarn", "dev", "-p", "4000"]