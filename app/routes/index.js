'use strict';

module.exports = function(app, request, stocks) {
    
    app.route('/')
        .get(function(request, response) {
            response.sendFile(process.cwd() + '/public/index.html');
        });
    
    app.route('/getStock')
        .get(function(req, response) {
            var stock = req.query.stock;
            console.log(stock);
            var parameters = {
                Normalized: false,
                NumberOfDays: 3650,
                DataPeriod: "Day",
                Elements: [{Symbol: stock,Type: "price",Params: ["ohlc"]}]
            };
            var url = 'http://dev.markitondemand.com/MODApis/Api/v2/InteractiveChart/json?parameters='+JSON.stringify(parameters);
            request.get({
                url: url,
                json: true,
                headers: {
                    'Content-Type': 'application/json'
                }
            }, function (e, r, b) {
                response.json(b);
            });
        });
    
    app.route('/getStocks')
        .get(function(request, response) {
            console.log('stocks: ' + stocks);
            var data = {
                stocks: stocks
            };
            console.log(data.stocks);
            response.json(data);
        });
        
    app.route('/removeStock')
        .get(function(request, response) {
            var stock = request.query.stock;
            var index = stocks.indexOf(stock);
            if (index !== -1) {
                stocks.splice(index, 1);
            }
         });
};