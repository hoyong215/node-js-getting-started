/*
const express = require('express')
const path = require('path')
const PORT = process.env.PORT || 5000

express()
  .use(express.static(path.join(__dirname, 'public')))
  .set('views', path.join(__dirname, 'views'))
  .set('view engine', 'ejs')
  .get('/', (req, res) => res.render('pages/index'))
  .listen(PORT, () => console.log(`Listening on ${ PORT }`))
*/


'use strict';

const XCTL_SERVER_IP = '121.134.7.206'
const XCTL_SERVER_PORT = '5050';


const express = require('express');
const SocketServer = require('ws').Server;
const path = require('path');

const PORT = process.env.PORT || 8887;
const INDEX = path.join(__dirname, 'index.html');

const server = express()
  .use((req, res) => res.sendFile(INDEX) )
  .listen(PORT, () => console.log(`Listening on ${ PORT }`));

const wss = new SocketServer({ server });



// 웹소켓 연결 이벤트 등록
var indexWeb = wss.on('connection', function(ws, req) {
	console.log(new Date() + ' : Websocket Start : ');
	
	// 소켓 생성
	ws.xClient = new net.Socket();

	// XCTL 소켓 연결
	ws.xClient.connect(XCTL_SERVER_PORT, XCTL_SERVER_IP, function() {
		console.log(new Date() + ' : XCTL Client Connected!!');
		
		this.setTimeout(600);
		this.setEncoding('utf8');
		
		ws.xClient.on('data', function(data) {
			console.log(new Date() + ' : XCTI -> Nodejs : ' + data);
			var cmd = data.split('|')[0];
			console.log(new Date() + ' : X -> N : Command : ' + cmd );
			
			// 웹소켓을 사용하여 브라우저에 응답값 전송
			ws.send(data);
		});

		ws.xClient.on('close', function() {
			console.log(new Date() + ' : XCTI Client Closed!!');
		});
		
	});

	ws.on('message', function incoming(message) {
		console.log(new Date() + ' : UI -> Nodejs : ' + message)
		
		// 암호화 SHA512
		if(message.split('_')[0] == 'CLIENT') {
			
			var pushMap = '';
			
			for(var i in message.split('_')) {				
				if( i == 5 ){
					pushMap += crypto.createHash('sha512').update( message.split('_')[5] ).digest('hex');
				}else{
					pushMap += message.split('_')[i] + '_';
				}				
			}
			
			message = pushMap;
		}

		console.log(new Date() + ' : Nodejs -> XCTL : ' + message)
		ws.xClient.write(message);
	});

	ws.onclose = function(e) {
		console.log(new Date() + ' : Websocket End!!');
		ws.xClient.end();
	};
	
});
