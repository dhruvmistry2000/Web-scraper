FROM node:18-slim AS scraper

RUN apt-get update && apt-get install -y \
  chromium \
  --no-install-recommends && \
  apt-get clean && rm -rf /var/lib/apt/lists/*

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true

WORKDIR /app

COPY package.json .
RUN npm install

COPY scrape.mjs .

FROM python:3.10-slim

RUN apt-get update && apt-get install -y \
  nodejs npm chromium \
  --no-install-recommends && \
  apt-get clean && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY --from=scraper /app/scrape.mjs .
COPY --from=scraper /app/package.json .
COPY --from=scraper /app/node_modules ./node_modules
COPY server.py .
COPY requirements.txt .

RUN pip install --no-cache-dir --break-system-packages -r requirements.txt

EXPOSE 5000

CMD node scrape.mjs && python server.py
