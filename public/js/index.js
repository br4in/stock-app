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
            var emptyData = [0, 0];
            seriesOptions[0] = {
                name: 'Empty',
                data: emptyData
            };
            createChart();
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
    
    function isValidSymbol(symbol) {
        $.getJSON('https://stock-app-br4in.c9users.io/lookupStock?stock='+symbol, function(data) {
            if (data.stock) {
                socket.emit('send', { stock: symbol });
            } else {
                alert('Invalid symbol');
            }
        });
    }

    // send new stock to server
    $('#send-btn').click(function() {
        var symbol = $('#new-stock').val().toUpperCase();
        if (names.indexOf(symbol) === -1) {
            isValidSymbol(symbol);
        } else {
            alert('Stock already exist.');
        }
    });
    
    $('#stocks').on('click', 'button', function(event) {
        var symbol = $(this).attr('id');
        socket.emit('remove', { stock: symbol });
        $(this).remove();
    });
    
    // Highchart dark theme
    Highcharts.createElement('link', {
        href: 'https://fonts.googleapis.com/css?family=Unica+One',
        rel: 'stylesheet',
        type: 'text/css'
    }, null, document.getElementsByTagName('head')[0]);

    Highcharts.theme = {
        colors: ['#2b908f', '#90ee7e', '#f45b5b', '#7798BF', '#aaeeee', '#ff0066', '#eeaaee',
      '#55BF3B', '#DF5353', '#7798BF', '#aaeeee'],
        chart: {
            backgroundColor: {
            linearGradient: { x1: 0, y1: 0, x2: 1, y2: 1 },
            stops: [
                [0, '#2a2a2b'],
                [1, '#3e3e40']
            ]
        },
        style: {
            fontFamily: '\'Unica One\', sans-serif'
        },
        plotBorderColor: '#606063'
        },
        title: {
            style: {
                color: '#E0E0E3',
                textTransform: 'uppercase',
                fontSize: '20px'
            }
        },
        subtitle: {
            style: {
                color: '#E0E0E3',
                textTransform: 'uppercase'
            }
        },
        xAxis: {
            gridLineColor: '#707073',
            labels: {
            style: {
                color: '#E0E0E3'
            }
        },
        lineColor: '#707073',
        minorGridLineColor: '#505053',
        tickColor: '#707073',
        title: {
            style: {
                color: '#A0A0A3'
                }
            }
        },
        yAxis: {
            gridLineColor: '#707073',
            labels: {
            style: {
                color: '#E0E0E3'
            }
        },
        lineColor: '#707073',
      minorGridLineColor: '#505053',
      tickColor: '#707073',
      tickWidth: 1,
      title: {
         style: {
            color: '#A0A0A3'
         }
      }
   },
   tooltip: {
      backgroundColor: 'rgba(0, 0, 0, 0.85)',
      style: {
         color: '#F0F0F0'
      }
   },
   plotOptions: {
      series: {
         dataLabels: {
            color: '#B0B0B3'
         },
         marker: {
            lineColor: '#333'
         }
      },
      boxplot: {
         fillColor: '#505053'
      },
      candlestick: {
         lineColor: 'white'
      },
      errorbar: {
         color: 'white'
      }
   },
   legend: {
      itemStyle: {
         color: '#E0E0E3'
      },
      itemHoverStyle: {
         color: '#FFF'
      },
      itemHiddenStyle: {
         color: '#606063'
      }
   },
   credits: {
      style: {
         color: '#666'
      }
   },
   labels: {
      style: {
         color: '#707073'
      }
   },

   drilldown: {
      activeAxisLabelStyle: {
         color: '#F0F0F3'
      },
      activeDataLabelStyle: {
         color: '#F0F0F3'
      }
   },

   navigation: {
      buttonOptions: {
         symbolStroke: '#DDDDDD',
         theme: {
            fill: '#505053'
         }
      }
   },

   // scroll charts
   rangeSelector: {
      buttonTheme: {
         fill: '#505053',
         stroke: '#000000',
         style: {
            color: '#CCC'
         },
         states: {
            hover: {
               fill: '#707073',
               stroke: '#000000',
               style: {
                  color: 'white'
               }
            },
            select: {
               fill: '#000003',
               stroke: '#000000',
               style: {
                  color: 'white'
               }
            }
         }
      },
      inputBoxBorderColor: '#505053',
      inputStyle: {
         backgroundColor: '#333',
         color: 'silver'
      },
      labelStyle: {
         color: 'silver'
      }
   },

   navigator: {
      handles: {
         backgroundColor: '#666',
         borderColor: '#AAA'
      },
      outlineColor: '#CCC',
      maskFill: 'rgba(255,255,255,0.1)',
      series: {
         color: '#7798BF',
         lineColor: '#A6C7ED'
      },
      xAxis: {
         gridLineColor: '#505053'
      }
   },

   scrollbar: {
      barBackgroundColor: '#808083',
      barBorderColor: '#808083',
      buttonArrowColor: '#CCC',
      buttonBackgroundColor: '#606063',
      buttonBorderColor: '#606063',
      rifleColor: '#FFF',
      trackBackgroundColor: '#404043',
      trackBorderColor: '#404043'
   },

   // special colors for some of the
   legendBackgroundColor: 'rgba(0, 0, 0, 0.5)',
   background2: '#505053',
   dataLabelsColor: '#B0B0B3',
   textColor: '#C0C0C0',
   contrastTextColor: '#F0F0F3',
   maskColor: 'rgba(255,255,255,0.3)'
};

// Apply the theme
Highcharts.setOptions(Highcharts.theme);
    
});