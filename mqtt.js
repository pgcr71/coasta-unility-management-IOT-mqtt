//https://www.npmjs.com/package/mqtt
import mqtt from "mqtt";
import pkg from 'sqlite3';
import dayjs from "dayjs";
import fs from 'fs';

import Aedes from 'aedes'
import { createServer } from 'net'

const port = 1883

const aedes = new Aedes()
const server = createServer(aedes.handle)

server.listen(port, function () {
  console.log('server started and listening on port ', port)
})

const { verbose } = pkg;
var Topic = '#'; //subscribe to all topics
var Broker_URL = 'mqtt://localhost';

var options = {
	clientId: 'MyMQTT',
	port: 1883,
	//username: 'mqtt_user',
	//password: 'mqtt_password',	
	keepalive: 60
};

var client = mqtt.connect(Broker_URL, options);
client.on('connect', mqtt_connect);
client.on('reconnect', mqtt_reconnect);
client.on('error', mqtt_error);
client.on('message', mqtt_messsageReceived);
client.on('close', mqtt_close);

function mqtt_connect() {
	//console.log("Connecting MQTT");
	client.subscribe(Topic, mqtt_subscribe);
};

function mqtt_subscribe(err, granted) {
	console.log("Subscribed to " + Topic);
	if (err) { console.log(err); }
};

function mqtt_reconnect(err) {
	//console.log("Reconnect MQTT");
	//if (err) {console.log(err);}
	client = mqtt.connect(Broker_URL, options);
};

function mqtt_error(err) {
	console.log("Error!");
	if (err) { console.log(err); }
};


//receive a message from MQTT broker
function mqtt_messsageReceived(topic, message, packet) {

	var message_str = message.toString(); //convert byte array to string
	console.log(message_str, topic)
	message_str = message_str.replace(/\n$/, ''); //remove new line
	//payload syntax: clientID,topic,message

	insert_message(topic, message_str, packet);
	//console.log(message_arr);

};

function mqtt_close() {
	console.log("Closed MQTT");
};

////////////////////////////////////////////////////
///////////////////// MYSQL ////////////////////////
////////////////////////////////////////////////////

const sqlite = verbose();
const date = dayjs().format('DDMMYYYYHH')

if (!fs.existsSync("databases")){
    fs.mkdirSync("databases");
}
let databasePath = `./databases/${date}.db`;
const db = new sqlite.Database(databasePath);
db.serialize(() => {
	//Create Connection
	db.get("SELECT * FROM sqlite_master WHERE type='table' AND name='info'", (err, res) => {
		if (!res)
			db.run("CREATE TABLE info (topic Text, message TEXT, created_at TEXT)");
	})
})

function insert_message(topic, message_str, packet) {
	db.serialize(() => {
		const stmt = db.prepare("INSERT INTO info VALUES (?, ?, ?)");
		var params = [topic, message_str, new Date().toISOString()];
		stmt.run(params);
		stmt.finalize();
	})

};



//split a string into an array of substrings

