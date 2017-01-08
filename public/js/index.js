/* global $ Highcharts io*/

$(document).ready(function(){
    var socket = io.connect('https://stock-app-br4in.c9users.io:8080');
    
    var seriesOptions = [],
        seriesCounter = 0,
        names = [];
    
    Array.prototype.combine = function(arr) {
        return this.map(function(v,i) {
            return [v, arr[i]];
        });
    };

    // get stocks array from server and reload
    socket.on('stocksArray', function(data) {
        console.log('Stock array : '+JSON.stringify(data.stocks));
        names = data.stocks;
        seriesOptions = [];
        appendStocksBtns();
        getStocks();
    });
    // get new stock from server
    socket.on('stock', function(data) {
        console.log('New stock : '+JSON.stringify(data));
        names.push(data.stock);
        // reload the chart and remove div
        appendStocksBtns();
        getStocks();
    });
    // get stock to remove
    socket.on('remove', function(data) {
        console.log('Stock to remove : '+JSON.stringify(data));
        removeStock(data.stock);
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
        if (names.length > 0) {
            $.each(names, function (i, name) {
                $.getJSON('https://stock-app-br4in.c9users.io/getStock?stock='+name, function (data) {
                    if (data.Elements !== undefined) {
                        // combine unix dates and stock values
                        var stockData = data.unixDates.combine(data.Elements[0].DataSeries.close.values);
                        seriesOptions[i] = {
                            name: name,
                            data: stockData
                        };
                        // As we're loading the data asynchronously, we don't know what order it will arrive. So
                        // we keep a counter and create the chart when all the data is loaded.
                        seriesCounter += 1;
                        if (seriesCounter === names.length) {
                            createChart();
                        }
                    }
                });
            });
        } else {
            alert('Handle empty chart!');
        }
    }
    
    function appendStocksBtns() {
        $('#stocks').empty();
        for (var i = 0; i < names.length; i++) {
            var stockBtn = '<button id='+names[i]+' class="remove-stock"><a>'+names[i]+'</a></button>';
            $('#stocks').append(stockBtn);
        }
    }
    
    function removeStock(stock) {
        for (var i = 0; i < seriesOptions.length; i++) {
            if (seriesOptions[i].name === stock) {
                seriesOptions.splice(i, 1);
            }
        }
        var index = names.indexOf(stock);
        if (index !== -1) {
            names.splice(index, 1);
        }
        getStocks();
        appendStocksBtns();
    }

    // send new stock to server
    $('#send-btn').click(function() {
        var symbol = $('#new-stock').val();
        socket.emit('send', { stock: symbol });
    });
    
    $('#stocks').on('click', 'button', function(event) {
        // remove button, emit name, update names, series, reload chart
        var symbol = $(this).attr('id');
        socket.emit('remove', { stock: symbol });
        $(this).remove();
    });
    
});
