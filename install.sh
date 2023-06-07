wget -qO - https://artifacts.elastic.co/GPG-KEY-elasticsearch | sudo apt-key add -
sudo apt-get install apt-transport-https
echo "deb https://artifacts.elastic.co/packages/7.x/apt stable main" | sudo tee /etc/apt/sources.list.d/elastic-7.x.list
sudo apt-get update
sudo apt-get install elasticsearch

echo "cluster.name: eddn-project
node.name: node-1
path.data: /var/lib/elasticsearch
path.logs: /var/log/elasticsearch
network.host: localhost"| sudo tee /etc/elasticsearch/elasticsearch.yml

sudo service elasticsearch restart

curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash - &&\
sudo apt-get install -y nodejs
sudo npm install -g pm2

cd ~
git clone https://github.com/b-vest/eddn-elastic-webapp.git
cd eddn-elastic-webapp/
npm install

pm2 start ~/eddn-elastic-webapp/eddn-parser.js
pm2 start ~/eddn-elastic-webapp/eddn-webserver.js