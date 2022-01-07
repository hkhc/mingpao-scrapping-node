#!/bin/bash

filtered_param=()

while [ $# -gt 0 ]
do
  # param name and value are delimited by =
  param_name=${1%=*}
  param_value=${1#*=}
  case "$param_name" in
    # take --base-path param to set the volume mapping of docker container
    --base-path) BASE_PATH=$param_value ; shift ;;
    *) filtered_param+=( "$1" ); shift ;;
  esac
done

printf -v filtered_param_list "%s " "${filtered_param[@]}"
filtered_param_list=${filtered_param_list%,}

# set default path if it is not specified
BASE_PATH=${BASE_PATH:-/Users/hc/work/mingpao}

mkdir -p "$BASE_PATH"

# shellcheck disable=SC2086
docker run --pull=always --name "Mingpao-Scrapping" --user "$(id -u):$(id -g)" -it --rm -e "TZ=Asia/Hong_Kong" --env-file env.txt -v $BASE_PATH:/data \
  registry.wingcommander.duckdns.org/hkhc/mingpao:latest \
  --base-path=/data \
  $filtered_param_list

