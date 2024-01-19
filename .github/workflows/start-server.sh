#!/bin/bash
npm install -g pm2
pm2 start npm --name "video-streaming-server" -- start