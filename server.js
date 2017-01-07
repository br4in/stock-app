var express = require("express"),
    app = express(),
    routes = require("./app/routes/index.js"),
    path = require("path"),
    http = require("http"),
    server = http.createServer(app),
    io = require('socket.io').listen(server),
    bodyParser = require("body-parser"),
    request = require("request");
    

app.use(express.static(path.join(__dirname, '/public')));
app.use('/controllers', express.static(process.cwd() + '/app/controllers'));
app.use('/js', express.static(process.cwd() + '/public/js'));
app.use(bodyParser.urlencoded({ extended: false }));

routes(app, request);

var stocks = ['AAPL'];

io.sockets.on('connection', function(socket) {
    console.log('Connection');
    socket.emit('message', { message: 'Welcome:'});
    socket.on('send', function(data) {
        console.log('data ' + JSON.stringify(data));
        io.sockets.emit('message', data); 
    });
    
    socket.on('remove', function(data) {
        console.log('remove last ', data);
        io.sockets.emit('remove', data);
    });
});

server.listen('8080', function() {
    console.log('Server listening on port 8080');
});