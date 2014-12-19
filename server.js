// import and create the server app
// setting the requests handler to handler.

var app = require('http').createServer(handler)
var io = require('socket.io')(app);
var fs = require('fs');
var request = require('request');
 
// now listen for any requests. 
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
 

// now set up the websocket connection handler.
// 
io.on('connection', function(socket){
	console.log('a user connected');
	collect(socket); // we are connected go and get some data and send it.

	// set up some timer threads.
	var timer = setInterval(function() { 
			collect(socket);
		}, 35000); // do this every 35 seconds.
	var ping = setInterval(function() {
		// broadcast ping
			socket.emit('ping', { spin: spin++});
		}, 3000); // send  a ping every 3 seconds

	// if we disconnect kill the timer threads.	 
	socket.on('disconnect', function () {
		clearInterval(timer);
		clearInterval(ping);
	});
});
 
 
// collector
function collect(socket) {
	console.log('in collect');
	var url = 'http://www.google.com/finance/info?client=ig&q=AAPL,N,GOOG,MSFT'
	// requst for google quotes.
	request({
		url: url,
		proxy: 'http://10.38.89.25:8080'}, function (error, response, body) {
			// if no error and all is well  process the data
		if (!error && response.statusCode == 200) {
			// skip leading // then parse
			var quotes = JSON.parse(body.substring(3));
			console.log(quotes);
			// broadcast  the data to all the clients
			socket.emit('quotes', { quotes: quotes, timestamp: new Date().getTime()});
		} else {
		console.log(error);
		}
	});
} 