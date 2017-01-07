'use strict';

module.exports = function(app, request) {
    
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
                NumberOfDays: 365,
                DataPeriod: "Day",
                Elements: [{Symbol: stock,Type: "price",Params: ["c"]}]
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
};