const express = require('express')
const path = require('path')
const PORT = process.env.PORT || 5000

express()
  .use(express.static(path.join(__dirname, 'public')))
  .set('views', path.join(__dirname, 'views'))
  .set('view engine', 'ejs')
  .get('/', (req, res) => res.render('pages/index'))
  .listen(PORT, () => console.log(`Listening on ${ PORT }`))




const HTTP_SERVER_PORT = 8887; 
const XCTL_SERVER_IP = '121.134.7.206'
const XCTL_SERVER_PORT = '5050';

// 암호화 모듈
const crypto = require('crypto');

// 웹서버 모듈 (의존모듈들 없는것을 설치)
var https = require('https');

// 파일 시스템 모듈
var fs = require('fs');


//  웹서버 생성
var httpsServer = https.createServer( function(request, response) {
	console.log(new Date() + ' : nodejs page : test');
    console.log((new Date()) + ' Received request for ' + request.url);
    response.writeHead(404);
    response.end();
});

// 포트설정
httpsServer.listen(HTTP_SERVER_PORT, () => {
	console.log(new Date() + ' : Server running at');
});

// 소켓 모듈 (XCTL 연동용)
var net = require('net'); 

// 웹소켓 서버 생성
var wss = new WebSocketServer({
    server: httpsServer,
    autoAcceptConnections: false
});

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
		console.log(new Date() + ' : Nodejs -> XCTL : ' + message)
		ws.xClient.write(message);
	});

	ws.onclose = function(e) {
		console.log(new Date() + ' : Websocket End!!');
		ws.xClient.end();
	};
	
});
