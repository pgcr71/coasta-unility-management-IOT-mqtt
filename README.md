# coasta-unility-management-IOT-mqtt

1) install nodejs from https://nodejs.org/en
2) change the required options in index.js
2) npm install
3) npm install pm2 -g
4) npm run dev
5) server should be listening for all the messages published and should store info in coasta.db sqlite database file
6) for production pm2 start mqtt.js

opti0nal
7) download https://github.com/jessety/pm2-installer/archive/main.zip
8)  as admin, npm run configure
9) as admin, npm run configure-policy
10) as admin, npm run setup

to remove 
10) npm run remove
11) npm run deconfigure

12) to sync records, create .env file, insert below user and password
    BASIC_AUTH_USER=''
    BASIC_AUTH_PASSWORD='' 

 13) run node --env-file=.env ./cronjobs.js
