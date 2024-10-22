import { Service } from 'node-windows';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const mqttpath = path.resolve(__dirname, 'mqtt.js');
// Create a new service object
const svc = new Service({
    name: 'coastautilfacts',
    description: 'a sevice to capture entity cosumptions',
    script: mqttpath,
    nodeOptions: [
        "--env-file=.env"
    ]
    //, workingDirectory: '...'
    //, allowServiceLogon: true
});

// Listen for the "install" event, which indicates the
// process is available as a service.
svc.on('install', function () {
    svc.start();
});

svc.install();