# Project Summary

This project focuses on building an EDDN Datastream application that harnesses the power of real-time data updates from the EDDN (Elite Dangerous Data Network). The point of this project is not so much about an addon to the game but more about working with a realtime dataset that is rich with data types. 

By leveraging technologies such as Elasticsearch, Node.js, and WebSockets, this application enables efficient data indexing, server-side development, and real-time communication.

The guide covers the installation and setup of Elasticsearch and Node.js, along with server configuration and WebSocket establishment. It also delves into real-time data processing, indexing, and searching using Elasticsearch. Engaging user experiences are created through visualizations powered by libraries such as D3.js and Three.js.

While the project focuses on Elite Dangerous and the EDDN feed, the concepts and techniques can be adapted to suit specific requirements. The project provides a comprehensive understanding of working with real-time data, analyzing it effectively, and creating captivating visualizations.

Join us on this exciting journey of building your own EDDN Datastream application and explore the dynamic world of real-time data.


## Quick Install
This is designed to work on Ubunut 22.04. It should work on other Debian based distros but I have only tested this on Ubuntu 22.04.

To get this going quickly run all of the commands below.

```
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
```

    The first two sed commands modify the contents of the /etc/needrestart/needrestart.conf file. The first command replaces the line #$nrconf{restart} = 'i'; with $nrconf{restart} = 'a';. The second command replaces the line #$nrconf{kernelhints} = -1; with $nrconf{kernelhints} = -1;. The sed -i option modifies the file in-place.

    sudo apt update updates the package lists for upgrades and installs.

    sudo apt upgrade -y upgrades the installed packages with the -y option that automatically answers "yes" to any prompts.

    wget -qO - https://artifacts.elastic.co/GPG-KEY-elasticsearch | sudo apt-key add - retrieves the GPG key for Elasticsearch and adds it to the keyring.

    sudo apt-get install apt-transport-https installs the apt-transport-https package, which allows the use of HTTPS repositories with APT.

    echo "deb https://artifacts.elastic.co/packages/7.x/apt stable main" | sudo tee /etc/apt/sources.list.d/elastic-7.x.list adds the Elastic package repository to the APT sources list.

    sudo apt-get update updates the package lists again to include the new repository.

    sudo apt-get install elasticsearch installs Elasticsearch from the added repository.

    The next set of commands use echo and tee to write a multi-line configuration to the /etc/elasticsearch/elasticsearch.yml file, which specifies various settings for Elasticsearch.

    sudo service elasticsearch restart restarts the Elasticsearch service to apply the new configuration.

    npm install --prefix ~/eddn-elastic-webapp/ ~/eddn-elastic-webapp/ installs the Node.js dependencies for the eddn-elastic-webapp project located in the ~/eddn-elastic-webapp/ directory.

    curl is used to send HTTP requests. The provided command sends a PUT request to create an Elasticsearch index template named stellar_body_template using the JSON data from the stellar-body-elastic-index-template.json file.

    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash - && sudo apt-get install -y nodejs retrieves a script from the NodeSource repository to set up the Node.js repository for version 18.x. Then it installs Node.js and npm using apt-get.

    sudo npm install -g pm2 globally installs the pm2 package, which is a process manager for Node.js applications.

    pm2 start ~/eddn-elastic-webapp/eddn-parser.js and pm2 start ~/eddn-elastic-webapp/eddn-webserver.js start two Node.js applications (eddn-parser.js and eddn-webserver.js) using pm2 for process management.