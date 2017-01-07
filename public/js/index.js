/* global $ Highcharts io*/

$(document).ready(function(){
    // connect to websocket
    var socket = io.connect('https://stock-app-br4in.c9users.io:8080');
    
    var seriesOptions = [],
        seriesCounter = 0,
        names = [];

    /*
     * Create the chart when all data is loaded
     * @returns {undefined}
     */
    
    // get stocks array from server and populate names array and chart
    socket.on('stocksArray', function(data) {
        console.log(JSON.stringify(data.stocks));
        names = data.stocks;
        getStocks();
    });
    
    socket.on('stock', function(data) {
        console.log(JSON.stringify(data));
        // push new stock to names array
        names.push(data.stock);
        getStocks();
    });
    
    function createChart() {
        Highcharts.stockChart('container', {
            rangeSelector: {
                selected: 4
            },
            yAxis: {
                labels: {
                    formatter: function () {
                        return (this.value > 0 ? ' + ' : '') + this.value + '%';
                    }
                },
                plotLines: [{
                    value: 0,
                    width: 2,
                    color: 'silver'
                }]
            },
            plotOptions: {
                series: {
                    compare: 'percent',
                    showInNavigator: true
                }
            },
            tooltip: {
                pointFormat: '<span style="color:{series.color}">{series.name}</span>: <b>{point.y}</b> ({point.change}%)<br/>',
                valueDecimals: 2,
                split: true
            },
            series: seriesOptions
        });
    }

    function getStocks() {
        seriesCounter = 0;
        $.each(names, function (i, name) {
            $.getJSON('https://stock-app-br4in.c9users.io/getStock?stock='+name, function (data) {
                console.log('Name: '+ name + ' Data '+ JSON.stringify(data));
                if (data.Elements !== undefined) {
                    //console.log(JSON.stringify(data.Elements[0].DataSeries.close.values));
                    seriesOptions[i] = {
                        name: name,
                        data: data.Elements[0].DataSeries.close.values
                    };

                        // As we're loading the data asynchronously, we don't know what order it will arrive. So
                    // we keep a counter and create the chart when all the data is loaded.
                    seriesCounter += 1;

                    if (seriesCounter === names.length) {
                        createChart();
                    }
                } else {
                    alert('undefined');
                }
            });
        });
    }
    
    function getStocksArray(callback) {
        $.getJSON('https://stock-app-br4in.c9users.io/getStocks', function(data) {
            names = data.stocks;
            console.log(names);
            callback();
        });
    }
    
    // on new stock sent, get value from input and retrieve api data ---- emit new stock 
    $('#send-btn').click(function() {
        var label = $('#new-stock').val();
        socket.emit('send', { stock: label });
    });
    
});
