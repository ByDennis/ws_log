import fs from 'fs';
import exec from 'child_process'; 
import {WS_LOG} from './ws_log.conf'; 
import ws from 'websocket';

let client = new ws.client(),
_config = {...WS_LOG};
 
client.on('connectFailed', (error) => {
    console.log(`Connection Error: ${error.toString()}`);
});
 
client.on('connect', (connection) => {
    console.log('WebSocket Client Connected');
    if(!fs.exists(_config.config.log_path)){
        console.log("create log file!");
        exec.exec(`echo "" >> ${_config.config.log_path}`);
    }
    connection.send(JSON.stringify(_config.config.open_key));
    connection.on('error', (error) => {
        console.log(`Connection Error: ${error.toString()}`);
    });
    connection.on('close', () => {
        console.log('echo-protocol Connection Closed');
    });
    connection.on('message', (message) => {
        if (message.type === 'utf8') {
            console.log(`Received new data!`);
        }
        fs.appendFile(_config.config.log_path,message.utf8Data);
    });
    
    function sendNumber() {
        if (connection.connected) {
            var number = Math.round(Math.random() * 0xFFFFFF);
            connection.sendUTF(number.toString());
            setTimeout(sendNumber, 1000);
        }
    }
    sendNumber();
});
 
client.connect(_config.config.url);