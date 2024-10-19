# coasta-unility-management-IOT-mqtt

1) install nodejs from https://nodejs.org/en
2) change the required options in index.js
2) npm install
3) npm install pm2 -g
5) server should be listening for all the messages published and should store info in databases folder
6) to sync records, create .env file, insert below user and password
    BASIC_AUTH_USER=''
    BASIC_AUTH_PASSWORD='' 
7) pm2 start process.json
8) open powershell, run pm2-service-install.ps1


