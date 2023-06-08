#!/usr/bin/bash

sudo sed -i 's/#$nrconf{restart} = '"'"'i'"'"';/$nrconf{restart} = '"'"'a'"'"';/g' /etc/needrestart/needrestart.conf
sed -i "s/#\$nrconf{kernelhints} = -1;/\$nrconf{kernelhints} = -1;/g" /etc/needrestart/needrestart.conf
sudo apt update
sudo apt upgrade -y
wget -qO - https://artifacts.elastic.co/GPG-KEY-elasticsearch | sudo apt-key add -
sudo apt-get install apt-transport-https
echo "deb https://artifacts.elastic.co/packages/7.x/apt stable main" | sudo tee /etc/apt/sources.list.d/elastic-7.x.list
sudo apt-get update
sudo apt-get install elasticsearch

echo "cluster.name: eddn-project
node.name: node-1
path.data: /var/lib/elasticsearch
path.logs: /var/log/elasticsearch
network.host: localhost" | sudo tee /etc/elasticsearch/elasticsearch.yml

sudo service elasticsearch restart

npm install --prefix ~/eddn-elastic-webapp/ ~/eddn-elastic-webapp/

curl -XPUT "http://localhost:9200/_template/stellar_body_template?include_type_name" -H 'Content-Type: application/json' -d @./stellar-body-elastic-index-template.json

curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash - &&\
sudo apt-get install -y nodejs
sudo npm install -g pm2

pm2 start ~/eddn-elastic-webapp/eddn-parser.js
pm2 start ~/eddn-elastic-webapp/eddn-webserver.js