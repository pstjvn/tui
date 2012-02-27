#!/bin/bash

#build the JS files into one monolitic file

n use 0.6.11 ~/node_modules/requirejs/bin/r.js -o name=start out=built.js baseUrl="app" paths="{'types':'../library/js/types','window':'../library/js/window','utils/autoid':'../library/js/utils/autoid','templates/compiler':'../library/js/templates/compiler','support':'../library/js/support','shims':'../library/js/shims','oop':'../library/js/oop','nls':'../library/js/nls','net':'../library/js/net','json':'../library/js/json','loader':'../library/js/loader','host':'../library/js/host','env/exports':'../library/js/env/exports','dom':'../library/js/dom','debug':'../library/js/debug','array':'../library/js/array','text':'../library/js/text','string':'../library/js/string','datetime/xdate':'../library/js/datetime/xdate'}"

#contact all CSS files

cat app/css/appselector3.css app/css/audio-player.css app/css/basic-reset.css app/css/epg.css app/css/nflist.css app/css/infobar.css app/css/infobuttons.css app/css/list.css app/css/menus.css app/css/mosaic.css app/css/multiscreenchooser.css app/css/multiselect.css app/css/reset.css app/css/setupminis.css app/css/start.css app/css/telephony.css app/css/vkbd.css app/css/weather.css > app/css/style-built.css
