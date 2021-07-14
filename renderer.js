// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// No Node.js APIs are available in this process because
// `nodeIntegration` is turned off. Use `preload.js` to
// selectively enable features needed in the rendering
// process.

const serialport = require('serialport')
const readline = require('@serialport/parser-readline')

var port_name = ''
var port = null
var baudrate = 460800
var databits = 8
var parity = 'none'
var stopbits = 1
var rtscts = false
var console_h = 0

$('#baudrate input').val(baudrate)
$('#databits input').val(databits)
$('#parity input').val(parity)
$('#stopbits input').val(stopbits)

$(window).on({
    'load': function () {
        var win_h = $(window).outerHeight()
        var serial_h = $('#serial-seg').outerHeight()
        console_h = $('#console-seg').outerHeight()
        $('#console-log').innerHeight(win_h - serial_h - console_h)
    },
    'resize': function () {
        var win_h = $(window).outerHeight()
        var serial_h = $('#serial-seg').outerHeight()
        $('#console-log').innerHeight(win_h - serial_h - console_h)
    }
});

$('#option').accordion({
    onOpen: function () {
        var win_h = $(window).outerHeight()
        var serial_h = $('#serial-seg').outerHeight()
        $('#console-log').innerHeight(win_h - serial_h - console_h)
    },
    onClose: function () {
        var win_h = $(window).outerHeight()
        var serial_h = $('#serial-seg').outerHeight()
        $('#console-log').innerHeight(win_h - serial_h - console_h)
    }
});

$('#port-dropdown').dropdown({
    onShow: function () {
        serialport.list().then(
            function (ports, err) {
                if (err) {
                    console.log(err)
                    return
                }

                $('#port-list').empty()
                for (var port of ports) {
                    var item = $('<div>').attr({
                        class: 'item',
                        'data-value': port['path']
                    })
                    item.text(port['path'])
                    $('#port-list').append(item)
                }

                if (ports.length == 0) {
                    $('#port-list').append('<div class="item disabled" data-value="no-port">no serial port</div>');
                }
            })
    },
    onChange: function (value, text, $choice) {
        port_name = value
    }
});

$('#baudrate').dropdown({
    onChange(value, text, $choice) {
        baudrate = parseInt(value)
    }
});

$('#databits').dropdown({
    onChange(value, text, $choice) {
        databits = parseInt(value)
    }
});

$('#parity').dropdown({
    onChange(value, text, $choice) {
        parity = value
    }
});

$('#stopbits').dropdown({
    onChange(value, text, $choice) {
        stopbits = parseInt(value)
    }
});

$('#rtscts').checkbox({
    onChecked: function () {
        rtscts = true
    },
    onUnchecked: function () {
        rtscts = false
    }
});

$('#port-open-close').on({
    'click': function () {
        if (port_name == '')
            return

        if (port != null && port.isOpen) {
            $('#port-open-close').addClass('loading')
            port.close(function (err) {
                $('#port-open-close').removeClass('loading')
                if (err) {
                    return console.log('Error on close: ', err);
                } else {
                    port = null
                }
            })
            return
        }

        port = new serialport(port_name, {
            baudRate: baudrate,
            dataBits: databits,
            parity: parity,
            stopBits: stopbits,
            rtscts: rtscts,
            autoOpen: false
        })
        var parser = new readline({ delimiter: '\n' })
        port.pipe(parser)

        $('#port-open-close').addClass('loading')
        port.open(function (err) {
            $('#port-open-close').removeClass('loading')
            if (err) {
                $('#port-dropdown').transition({ animation: 'shake', duration: 200 })
                port = null
                return console.log('Error on open: ', err)
            }
        })

        port.on('open', function () {
            $('#port-open-close').html('Close')
            console.log('Opened: ', port.path)
        })

        port.on('close', function () {
            $('#port-open-close').html('Open');
            console.log('Closed')
        })

        port.on('error', function (error) {
            console.log('Error: ', error)
        })

        parser.on('data', function (data) {
            var log_cnt = $('#console-log div').length
            if (log_cnt >= 50) {
                $('#console-log div:first').remove()
            }

            var new_log = $('<div>')
            new_log.html(data.toString())

            $('#console-log').append(new_log)
            $('#console-log').scrollTop($('#console-log')[0].scrollHeight)
        })
    }
});

$('#send-message').on({
    'click': function () {
        send_message()
    }
});

$('#message').on({
    'keypress': function (e) {
        if (e.which == 13) {
            send_message()
        }
    }
});

function send_message() {
    if (port == null) {
        $('#message').parent().transition({ animation: 'shake', duration: 200 })
        return
    }

    var msg = $('#message').val() + '\n'
    port.write(msg, function (err) {
        if (err) {
            return console.log('Error on write: ', err)
        }
    })
    $('#message').val('')
};
