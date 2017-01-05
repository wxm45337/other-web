var app = require('./config/koa.config'),
	http = require('http');
// var port = normalizePort(process.env.PORT||3000);

/**
 * Create HTTP server
 */
var httpserv = http.createServer(app.callback());
process.on('uncaughtException', function(e) {
    console.error('Error: ' + e);
});

console.log('运行平台:'+process.platform);
if(process.platform!='win32'){

	var server = require('socket.io'),
    pty = require('pty.js'),
    CryptoJS = require("crypto-js");
	var io = server(httpserv,{path: '/sshterm/socket.io'});
	io.on('connection', function(socket){
		var sshport = 22;
		var sshuser = '';
		var sshhost = '';
		var sshpassword = '';
		var sshauth = 'password';
	    var request = socket.request;

	    console.log((new Date()) + ' Connection accepted.');
	    // console.log('match',request.headers.referer.match('/sshterm/.+$'));
	    // if (match = request.headers.referer.match('/sshterm/.+$')) {
	    //     var pms = match[0].replace('/sshterm/', '').split('/');
	    //     sshhost = pms[0];
	    //     sshuser = pms[1];
	    //     sshpassword = CryptoJS.AES.decrypt(pms[2],'sshterm ithlw').toString(CryptoJS.enc.Utf8);
	    // } else if (globalsshuser) {
	    //     sshuser = globalsshuser;
	    // }
	    // 
	    socket.on('termconnection',function(data){
    	    sshhost = data.sshhost;
    	    sshuser = data.sshuser;
    	    sshpassword = CryptoJS.AES.decrypt(data.sshpassword,'sshterm ithlw').toString(CryptoJS.enc.Utf8);
    	    sshport = data.sshport?data.sshport:sshport;
            console.log('sshhost:'+sshhost,'sshuser:'+sshuser,'sshpassword:'+sshpassword,'sshport:'+sshport);
    	    var term;
    	    if (process.getuid() == 0) {
    	        term = pty.spawn('/bin/login', [], {
    	            name: 'xterm-256color',
    	            cols: 80,
    	            rows: 30
    	        });
    	    } else {
    	    	if(sshpassword){
    		        term = pty.spawn('sshpass', ['-p'+sshpassword,'ssh',sshuser +'@'+sshhost, '-p', sshport, '-o', 'PreferredAuthentications=' + sshauth], {
    		            name: 'xterm-256color',
    		            cols: 80,
    		            rows: 30
    		        });
    		    } else {
    		        term = pty.spawn('ssh', [sshuser +'@'+sshhost, '-p', sshport, '-o', 'PreferredAuthentications=' + sshauth], {
    		            name: 'xterm-256color',
    		            cols: 80,
    		            rows: 30
    		        });
    		    }
    	    }
    	    console.log((new Date()) + " PID=" + term.pid + " STARTED on behalf of user=" + sshuser+'@'+sshhost);
    	    term.on('data', function(data) {
    	        socket.emit('output', data);
    	    });
    	    term.on('exit', function(code) {
    	        console.log((new Date()) + " PID=" + term.pid + " ENDED")
    	    });
    	    socket.on('resize', function(data) {
    	        term.resize(data.col, data.row);
    	    });
    	    socket.on('input', function(data) {
    	        term.write(data);
    	    });
    	    socket.on('disconnect', function() {
    	        term.end();
    	    }); 
	    });
	});
}

httpserv.listen(3002);

/*function normalizePort(val){
	var port = parseInt(val,10);
	if(isNaN(port)){
		return val;
	}
	if(port>=0){
		return port;
	}
	return false;
}*/