var express = require("express"),
    app = express(),
    routes = require("./app/routes/index.js"),
    path = require("path"),
    http = require("http"),
    server = http.createServer(app),
    io = require('socket.io').listen(server),
    bodyParser = require("body-parser"),
    request = require("request"),
    stocks = ['AAPL', 'GOOGL', 'YHOO', 'NKE', 'SBUX'];
    
app.use(express.static(path.join(__dirname, '/public')));
app.use('/controllers', express.static(process.cwd() + '/app/controllers'));
app.use('/js', express.static(process.cwd() + '/public/js'));
app.use(bodyParser.urlencoded({ extended: false }));

routes(app, request, stocks);

io.sockets.on('connection', function(socket) {
    console.log('New socket connection');
    socket.emit('stocksArray', { stocks: stocks});
    // send stock
    socket.on('send', function(data) {
        console.log('data sent' + JSON.stringify(data.stock));
        stocks.push(data.stock);
        console.log('stocks '+stocks);
        io.sockets.emit('stock', data);
    });
    // remove stock
    socket.on('remove', function(data) {
        console.log('remove', data);
        // remove stock from stocks array ...
        io.sockets.emit('remove', data);
        console.log('emitted', data);
        var stock = data.stock;
        var index = stocks.indexOf(stock);
        if (index !== -1) {
            stocks.splice(index, 1);
        }
    });
});

server.listen('8080', function() {
    console.log('Server listening on port 8080');
});