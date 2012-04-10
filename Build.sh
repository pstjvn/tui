#!/bin/bash

#build the JS files into one monolitic file


NODE_VERSION='0.6.11'
RJS_EXEC_PATH='/home/peterj/node_modules/requirejs/bin/r.js'
NODE_EXE='n use'
BUILD_OPTIONS_PATH='app/app.build.js'

$NODE_EXE $NODE_VERSION $RJS_EXEC_PATH -o $BUILD_OPTIONS_PATH

#contact all CSS files

cat app/css/appselector3.css app/css/audio-player.css app/css/basic-reset.css app/css/epg.css app/css/nflist.css app/css/infobar.css app/css/infobuttons.css app/css/list.css app/css/menus.css app/css/mosaic.css app/css/multiscreenchooser.css app/css/multiselect.css app/css/reset.css app/css/setupminis.css app/css/start.css app/css/telephony.css app/css/vkbd.css app/css/weather.css > app/css/style-built.css
