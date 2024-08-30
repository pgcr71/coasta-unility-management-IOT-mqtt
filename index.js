
var mqtt = require('mqtt'); //https://www.npmjs.com/package/mqtt
var Topic = '#'; //subscribe to all topics
var Broker_URL = 'localhost';

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
	//console.log("Error!");
	//if (err) {console.log(err);}
};

function after_publish() {
	//do nothing
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
	//console.log("Close MQTT");
};

////////////////////////////////////////////////////
///////////////////// MYSQL ////////////////////////
////////////////////////////////////////////////////
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database("./coasta.db");
db.serialize(() => { //https://www.npmjs.com/package/mysql
	//Create Connection
	db.run("CREATE TABLE info (topic Text, message TEXT)");
})

// db.close()

//insert a row into the tbl_messages table
function insert_message(topic, message_str, packet) {
	db.serialize(() => { //https://www.npmjs.com/package/mysql
		//Create Connection
		const stmt = db.prepare("INSERT INTO info VALUES (?, ?)");
		var params = [topic, message_str];
		stmt.run(params);
		stmt.finalize();
	})

	// db.close();
};

//split a string into an array of substrings


//count number of delimiters in a string
var delimiter = ",";
function countInstances(message_str) {
	var substrings = message_str.split(delimiter);
	return substrings.length - 1;
};
