#!/bin/bash

curl -L -O https://github.com/gohugoio/hugo/releases/download/v0.126.0/hugo_extended_0.126.0_Linux-64bit.tar.gz
mkdir -p /home/vscode/.local/bin
tar -xvzf hugo_extended_0.126.0_Linux-64bit.tar.gz -C /home/vscode/.local/bin
rm hugo_extended_0.126.0_Linux-64bit.tar.gz
