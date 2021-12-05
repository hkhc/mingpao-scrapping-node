#!/bin/sh
docker buildx build --platform linux/arm64,linux/amd64 -t registry.wingcommander.duckdns.org/hkhc/mingpao:latest --push .
