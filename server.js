var express = require("express"),
    app = express(),
    routes = require("./app/routes/index.js"),
    path = require("path"),
    http = require("http"),
    server = http.createServer(app),
    io = require('socket.io').listen(server),
    bodyParser = require("body-parser"),
    request = require("request"),
    stocks = ['AAPL'];
    
app.use(express.static(path.join(__dirname, '/public')));
app.use('/controllers', express.static(process.cwd() + '/app/controllers'));
app.use('/js', express.static(process.cwd() + '/public/js'));
app.use(bodyParser.urlencoded({ extended: false }));

routes(app, request, stocks);

io.sockets.on('connection', function(socket) {
    console.log('Connection');
    socket.emit('stocksArray', { stocks: stocks});
    // send stock
    socket.on('send', function(data) {
        console.log('data ' + JSON.stringify(data.stock));
        stocks.push(data.stock);
        console.log(stocks);
        io.sockets.emit('stock', data);
    });
    // remove stock
    socket.on('remove', function(data) {
        console.log('remove', data);
        // remove stock from stocks array ...
        io.sockets.emit('remove', data);
    });
});

server.listen('8080', function() {
    console.log('Server listening on port 8080');
});