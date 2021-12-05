#!/bin/sh
docker run --pull=always --name "Mingpao-Scrapping" -it --rm -e "TZ=Asia/Hong_Kong" --env-file env.txt -v /Users/hc/work/mingpao:/data \
  registry.wingcommander.duckdns.org/hkhc/mingpao:latest \
  --base-path=/data \
  $@
