#!/bin/sh
echo Chrome version $(chromium-browser --version)
echo Chrome path $(which chromium-browser)
node src/index.js $@
