//https://www.npmjs.com/package/mqtt
import mqtt from "mqtt";
import pkg from 'sqlite3';
import dayjs from "dayjs";
import fs from 'fs';
import path from 'path';
import Aedes from 'aedes'
import { createServer } from 'net'
import {fileURLToPath} from 'url';

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
init()
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
	let x = JSON.parse(message.toString().trim());
	let y = [];
	if (x && x["data"] && x["data"]["modbus"]) {
		for (let obj of x["data"]["modbus"]) {
			let parameters = []
			for (let [key, value] of Object.entries(obj)) {
				if (['sid', 'stat', 'rcnt'].includes(key)) {
					continue
				}
				parameters.push({
					parameter: key,
					value,
					sid: obj['sid'],
					stat: obj['stat'],
					rctn: obj['rcnt']
				})
			}
			parameters.forEach(parmeter => {
				y.push({
					...x["data"],
					modbus: null,
					...parmeter,
				})
			})
		}
	} else {
		y.push(x)
	}

	//convert byte array to string

	insert_message(topic, JSON.stringify(y), packet);
	//console.log(message_arr);

};

function mqtt_close() {
	console.log("Closed MQTT");
};

////////////////////////////////////////////////////
///////////////////// MYSQL ////////////////////////
////////////////////////////////////////////////////

const sqlite = verbose();

let db;
if (!fs.existsSync("databases")) {
	fs.mkdirSync("databases");
}

function closeDataBaseConnection() {
	try {
		db && db.close()
	} catch(e) {
		console.log('counldn close existing connection')
	}
}

function createNewTable(db) {
	db.serialize(() => {
		//Create Connection
		db.get("SELECT * FROM sqlite_master WHERE type='table' AND name='info'", (err, res) => {
			if (!res)
				db.run("CREATE TABLE info (topic Text, message JSON, created_at TEXT)");
		})
	})
}

function init() {
	closeDataBaseConnection()
	try {
		const date = dayjs().format('DDMMYYYYHH')
		let databasePath = `./databases/${date}.db`;

		let db = new sqlite.Database(databasePath);
		createNewTable(db)

	} catch (e) {
		console.log('error in mqtt line 130')

	}
}


function insert_message(topic, message_str, packet) {
	console.log(db)
	const date = dayjs().format('DDMMYYYYHH');
	let databasePath = `./databases/${date}.db`;
	const __filename = fileURLToPath(import.meta.url);
	const __dirname = path.dirname(__filename);
	const desiredPath = path.resolve(__dirname, databasePath);
	if (!fs.existsSync(desiredPath)) {
		closeDataBaseConnection()
		db = new sqlite.Database(databasePath);
		createNewTable(db)
	}

	db.serialize(() => {
		const stmt = db.prepare("INSERT INTO info VALUES (?, ?, ?)");
		var params = [topic, message_str, new Date().toISOString()];
		stmt.run(params);
		stmt.finalize();
	})

};

// setTimeout(() =>mqtt_messsageReceived("ganesh", JSON.stringify({ "data":{ "mac":"D8478F926329","uid":1,"dtm":"20240908212506","seq":1350,"msg":"log","modbus": [{ "sid":12,"stat":0,"rcnt":  2,"EBKWh":1.84,"DGKWh":0.11 }] }}

// ), ''), 300)




//split a string into an array of substrings

