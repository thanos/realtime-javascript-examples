var app = require('http').createServer(handler)
var io = require('socket.io')(app);
var fs = require('fs');
var request = require('request');
 
app.listen(3000);

var spin =0;
 
function handler (req, res) {
	fs.readFile(__dirname + '/index.html', function (err, data) {
		if (err) {
			res.writeHead(500);
			return res.end('Error loading index.html');
		}
		res.writeHead(200);
		res.end(data);
	});
}
 
io.on('connection', function(socket){
	console.log('a user connected');
	collect(socket);
	var timer = setInterval(function() {
			collect(socket);
		}, 35000);
	var ping = setInterval(function() {
			socket.emit('ping', { spin: spin++});
		}, 3000);
	socket.on('disconnect', function () {
		clearInterval(timer);
		clearInterval(ping);
	});
});
 
 
// collector
function collect(socket) {
	console.log('in collect');
	var url = 'http://www.google.com/finance/info?client=ig&q=AAPL,N,GOOG,MSFT'
	request({
		url: url,
		proxy: 'http://10.38.89.25:8080'}, function (error, response, body) {
		if (!error && response.statusCode == 200) {
			// skipp leading // then parse
			var quotes = JSON.parse(body.substring(3));
			console.log(quotes);
			socket.emit('quotes', { quotes: quotes, timestamp: new Date().getTime()});
		} else {
		console.log(error);
		}
	});
} 