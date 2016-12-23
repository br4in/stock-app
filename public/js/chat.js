/* global $ io Chart*/

$(document).ready(function() {
    var messages = [],
    socket = io.connect('https://stock-app-br4in.c9users.io:8080');
    
    socket.on('message', function(data) {
        console.log(data);
        if (data.message) {
            messages.push(data.message);
            var html = '';
            for (var i = 0; i < messages.length; i++) {
                html += messages[i] + ' <br>';
            }
            $('#content').html(html);
        } else {
            console.log('Error!');
        }
    });
    
    socket.on('remove', function(data) {
        console.log(data);
        if (data.message) {
            var index = messages.indexOf(data.message);
            if (index !== -1) {
                messages.splice(index, 1);
                var html = '';
                for (var i = 0; i < messages.length; i++) {
                    html += messages[i] + ' <br>';
                }
                $('#content').html(html);
            }
        }
    });
    
    var ctx = document.getElementById('myChart').getContext('2d');
    var myChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['M', 'T', 'W', 'T', 'F', 'S', 'S'],
            datasets: [{
            label: 'apples',
            data: [12, 19, 3, 17, 6, 3, 7],
            backgroundColor: "rgba(153,255,51,0.4)"
        }, {
            label: 'oranges',
            data: [2, 29, 5, 5, 2, 3, 10],
            backgroundColor: "rgba(255,153,0,0.4)" }]
        }
    });

    
    $('#send').click(function() {
        var text = $('#message').val();
        socket.emit('send', { message: text});
    });
    
    $('#removeLast').click(function() {
        var last = messages[messages.length - 1];
        socket.emit('remove', { message: last});
    });
});