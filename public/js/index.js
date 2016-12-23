/* global $ Chart io*/

$(document).ready(function(){
    
    var socket = io.connect('https://stock-app-br4in.c9users.io:8080');
    
    var ctx = document.getElementById('myChart').getContext('2d');
    var myChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['M', 'T', 'W', 'T', 'F', 'M', 'T', 'W', 'T', 'F'],
            datasets: [{
                label: 'aapl',
                data: [112.12,113.95,113.3,115.19,115.19,115.82,115.97,116.64,116.95,117.06],
                backgroundColor: "rgba(153,255,51,0.4)"
                }]
        }
    });
});
