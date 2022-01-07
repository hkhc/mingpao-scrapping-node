FROM node:16.13.1-alpine3.14

RUN apk update && apk add --no-cache nmap mesa-gles && \
    echo @edge http://nl.alpinelinux.org/alpine/edge/community >> /etc/apk/repositories && \
    echo @edge http://nl.alpinelinux.org/alpine/edge/main >> /etc/apk/repositories && \
    apk update && \
    apk add --no-cache \
      chromium \
      harfbuzz \
      "freetype>2.8" \
      ttf-freefont \
      nss

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD 1
ENV PUPPETEER_EXECUTABLE_PATH /usr/bin/chromium-browser

ADD package.json /
ADD entrypoint.sh /
RUN npm install

RUN mkdir /src
RUN mkdir /data
COPY src /src

WORKDIR /
ENTRYPOINT ["/entrypoint.sh"]
