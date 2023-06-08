# Project Summary

This project focuses on building an EDDN Datastream application that harnesses the power of real-time data updates from the EDDN (Elite Dangerous Data Network). The point of this project is not so much about an addon to the game but more about working with a realtime dataset that is rich with data types. 

By leveraging technologies such as Elasticsearch, Node.js, and WebSockets, this application enables efficient data indexing, server-side development, and real-time communication.

The guide covers the installation and setup of Elasticsearch and Node.js, along with server configuration and WebSocket establishment. It also delves into real-time data processing, indexing, and searching using Elasticsearch. Engaging user experiences are created through visualizations powered by libraries such as D3.js and Three.js.

While the project focuses on Elite Dangerous and the EDDN feed, the concepts and techniques can be adapted to suit specific requirements. The project provides a comprehensive understanding of working with real-time data, analyzing it effectively, and creating captivating visualizations.

Join us on this exciting journey of building your own EDDN Datastream application and explore the dynamic world of real-time data.

As of 06/08/2023 this project is online and browsable at [https://eddnapp.baremetalbridge.com/](https://eddnapp.baremetalbridge.com/)


## Quick Install
This is designed to work on Ubunutu 22.04. It should work on other Debian based distros but I have only tested this on Ubuntu 22.04.

To get this going quickly run all of the commands below.

```
cd ~
git clone https://github.com/b-vest/eddn-elastic-webapp.git
sudo sed -i 's/#$nrconf{restart} = '"'"'i'"'"';/$nrconf{restart} = '"'"'a'"'"';/g' /etc/needrestart/needrestart.conf
sudo sed -i "s/#\$nrconf{kernelhints} = -1;/\$nrconf{kernelhints} = -1;/g" /etc/needrestart/needrestart.conf
sudo apt update
sudo apt upgrade -y
wget -qO - https://artifacts.elastic.co/GPG-KEY-elasticsearch | sudo apt-key add -
sudo apt-get install apt-transport-https
echo "deb https://artifacts.elastic.co/packages/7.x/apt stable main" | sudo tee /etc/apt/sources.list.d/elastic-7.x.list
sudo apt-get update
sudo apt-get install elasticsearch
echo "Configuring Elasticsearch"

echo "cluster.name: eddn-project
node.name: node-1
path.data: /var/lib/elasticsearch
path.logs: /var/log/elasticsearch
network.host: localhost" | sudo tee /etc/elasticsearch/elasticsearch.yml

echo "Starting Elasticsearch"
sudo service elasticsearch restart
echo "Elasticsearch Started"
cd ~/eddn-elastic-webapp
echo "Setting Elasticsearch index template"
curl -XPUT "http://localhost:9200/_template/stellar_body_template?include_type_name" -H 'Content-Type: application/json' -d @./stellar-body-elastic-index-template.json
echo "Installing NodeJS"
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash - &&\
sudo apt-get install -y nodejs
echo "Installing PM2"
sudo npm install -g pm2
echo "Installing NPM modules"
npm install 
echo "Starting EDDN parser"
pm2 start ~/eddn-elastic-webapp/eddn-parser.js
echo "Starting Web and Socket Server"
pm2 start ~/eddn-elastic-webapp/eddn-webserver.js
```

## Post-Installation Expectations

Once you've successfully installed and initiated the EDDN Datastream application, please remember that you're working with a real-time data feed. Therefore, initially, you may find only a limited amount of data available in the system.

The 2D graph on the main page, as well as the raw data section, should start populating with data almost immediately. You'll likely see a few data points plotted on the graph, representing the live data being processed. The raw data section will also begin to display a series of data entries as they stream in. These entries, although they might be sparse initially, represent the real-time nature of the EDDN feed.

However, the 3D star map, one of the more visually captivating features of this application, might not show much data at first. Given its complex nature and the depth of data it represents, it will require a more substantial data input to start revealing significant patterns. So, don't be discouraged if you're only seeing a minimal number of stars displayed. The data input from the EDDN feed is continual, and as more data is collected and processed, the 3D star map will gradually begin to fill in.

In essence, patience is key when working with real-time data. As the system continues to operate and collect data over time, your user experience will become richer and more informative. You're now plugged into the exciting, ever-evolving universe of Elite Dangerous, and you can look forward to seeing this dynamic dataset grow and develop in real time. Enjoy the journey!

## Further Information

At its current stage, it's important to note that the EDDN Datastream application presented in this project is a prototype, representing a proof-of-concept for the desired functionality. While it provides a foundation for working with real-time data from the EDDN feed and demonstrates basic visualizations and data processing, it is considered to be in a crude state.

The purpose of this initial version is to showcase the potential and serve as a starting point for future development. There are plans to evolve the application into a more optimized and robust system with enhanced features, improved performance, and a fully responsive interface. This includes expanding the available data, providing more comprehensive visualizations, and offering detailed explanations and insights.

The development roadmap for the EDDN Datastream application includes the following considerations:

   Enhanced Data Collection: The application will be designed to collect and process a wider range of data from the EDDN feed. This will involve expanding the data sources and incorporating additional data types to provide a more comprehensive view of the Elite Dangerous universe.

   Advanced Visualizations: Future iterations of the application will include more sophisticated visualizations, leveraging libraries such as D3.js and Three.js to create immersive and interactive experiences. These visualizations will allow users to explore the data from different perspectives and gain deeper insights into the dynamic nature of the universe.

   Responsive User Interface: The application will be optimized for different devices and screen sizes, ensuring a seamless user experience across desktop, tablet, and mobile platforms. The interface will be designed with user-friendliness in mind, providing intuitive navigation and clear explanations of the displayed data.

   Data Explanations and Insights: To enhance the user experience, the application will provide detailed explanations and insights into the collected data. This may include explanations of specific events or trends within the Elite Dangerous universe, highlighting interesting patterns, and offering contextual information to aid in understanding the significance of the data.

    
   Performance Optimization: Efforts will be made to optimize the performance of the application, ensuring efficient data processing, indexing, and searching using Elasticsearch. This will involve fine-tuning the backend processes, implementing caching mechanisms, and adopting best practices to deliver a responsive and seamless experience to users.

By evolving the current prototype into a fully optimized and feature-rich application, the aim is to create a powerful tool that enables users to delve deep into the dynamic world of real-time data in Elite Dangerous. With each iteration, the EDDN Datastream application will grow, providing an increasingly captivating and informative experience for users to explore and engage with the evolving universe.