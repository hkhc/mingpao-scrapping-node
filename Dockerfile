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


#FROM openjdk:11
#RUN apt-get -y update
#RUN apt-get -y upgrade
#
#ENV (dpkg --print-architecture)
#
#RUN apt-get -y install locales nodejs wget gnupg ca-certificates procps libxss1 \
#     && wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add - \
#     && sh -c 'echo "deb [arch=$(dpkg --print-architecture)] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list' \
#     && apt-get update
#     # We install Chrome to get all the OS level dependencies, but Chrome itself
#     # is not actually used as it's packaged in the node puppeteer library.
#     # Alternatively, we could could include the entire dep list ourselves
#     # (https://github.com/puppeteer/puppeteer/blob/master/docs/troubleshooting.md#chrome-headless-doesnt-launch-on-unix)
#     # but that seems too easy to get out of date.
#RUN apt-get install -y google-chrome-stable \
#     && rm -rf /var/lib/apt/lists/* \
#     && wget --quiet https://raw.githubusercontent.com/vishnubob/wait-for-it/master/wait-for-it.sh -O /usr/sbin/wait-for-it.sh \
#     && chmod +x /usr/sbin/wait-for-it.sh
#
#ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD 1
#
#RUN wget -O - https://www.npmjs.com/install.sh | sh
#
#ADD package.json /
#RUN npm install
#
#RUN echo "LC_ALL=en_US.UTF-8" >> /etc/environment
#RUN echo "en_US.UTF-8 UTF-8" >> /etc/locale.gen
#RUN echo "LANG=en_US.UTF-8" > /etc/locale.conf
#RUN locale-gen en_US.UTF-8
#
#ADD package.json /
#RUN npm install -g npm@8.2.0
#RUN npm install
#
#RUN mkdir /src
#RUN mkdir /data
#COPY src /src
#
#WORKDIR /
#ENTRYPOINT ["node","./src/index.js"]
