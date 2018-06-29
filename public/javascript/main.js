const router = new Navigo(null, false, '#');



$(function() {
    const controller = new Controller();
    controller.initTemplate();

    // [START ROUTE]
    router
        .on(function() {
            if (!window.localStorage.getItem('token')) {
                $('#page-container').empty();
                $('#page-container').append(controller.getTemplate('form-signin-template'))
            } else {
                controller.routerList()
            }
        })
        .resolve();
    router
        .on('/list', controller.routerList)
        .resolve();
    router
        .on('/login', function() {
            if (window.localStorage.getItem('token')) {
                router.navigate('/list')
                return;
            }
            $('#page-container').empty();
            $('#page-container').append(controller.getTemplate('form-signin-template'))
        })
        .resolve();
    router
        .on('/sign-up', function() {
            $('#page-container').empty();
            $('#page-container').append(controller.getTemplate('form-signup-template'))
        })
        .resolve();
    // [END ROUTE]



    $('#page-container').on('click', '.signin-goto-signup', function() {
        router.navigate('/sign-up')
    })
    $('#page-container').on('click', '.form-signin-submit', function() {
        controller.login(
            $('#signin-username').val(),
            $('#signin-inputPassword').val(),
        )
    })
    $('#page-container').on('click', '.form-signup-submit', function() {
        controller.signup(
            $('#signup-username').val(),
            $('#signup-inputPassword').val(),
            $('#signup-inputRePassword').val(),
        )
    });
    $('#logout').on('click', () => {
        controller.logOut()
    })
})

const Controller = function() {
    this.templates = {}
    this.devices = {};
    this.orders = {};
    this.records = {};
    this.intervalId = null;

    this.initTemplate = () => {
        $this = this;
        $('#templates .template').each(function() {
            var name = $(this).attr('id');
            var object = $(this).clone().removeClass('template');
            $(this).remove();
            $this.templates[name] = object
        })
    }

    this.getTemplate = (name) => {
        if (name in this.templates) {
            return this.templates[name].clone();
        } else {
            return $('<div/>')
        }
    }

    this.login = (username, password) => {
        $.post('https://us-central1-api-project-611301476725.cloudfunctions.net/temperature/login', {
            username: username,
            password: password
        }, (rs) => {
            if (rs.code == '0') {
                $('#errorModal .alert').html(rs.messages.join('<br/>'))
                $('#errorModal').modal('show');
            } else {
                window.localStorage.setItem('token', rs.data.token)
                router.navigate('/list')
            }
        }).fail(error => {
            $('#errorModal .alert').html('Server error!')
            $('#errorModal').modal('show');
        })
    }

    this.signup = (username, password, rePassword) => {
        if (!username || !password || !rePassword) {
            $('#errorModal .alert').html('Miss something')
            $('#errorModal').modal('show');
            return false;
        }
        if (password != rePassword) {
            $('#errorModal .alert').html('Re-Password wrong')
            $('#errorModal').modal('show');
            return false;
        }
        if (!username.match(/^[a-zA-Z0-9_]+$/g)) {
            $('#errorModal .alert').html('Username only accept character and number')
            $('#errorModal').modal('show');
            return false;
        }

        $.post('https://us-central1-api-project-611301476725.cloudfunctions.net/temperature/registration', {
            username: username,
            password: password,
            rePassword: rePassword
        }, (rs) => {
            if (rs.code == '0') {
                $('#errorModal .alert').html(rs.messages.join('<br/>'))
                $('#errorModal').modal('show');
            } else {
                router.navigate('/login')
            }
        }).fail(error => {
            $('#errorModal .alert').html('Server error!')
            $('#errorModal').modal('show');
        })
    }

    this.loadDevices = () => {
        $.get('https://us-central1-api-project-611301476725.cloudfunctions.net/temperature/auth/list-device?accessToken=' + window.localStorage.getItem('token'), (rs) => {
            if (rs.code != '0') {
                this.devices = rs.data.data;
                this.devices.forEach(device => {
                    $('#list-device').append('<li class="list-group-item">' + device.code + '</li>');
                })


            }

        })
    }
    this.loadOrders = () => {
        $.get('https://us-central1-api-project-611301476725.cloudfunctions.net/temperature/auth/list-order?accessToken=' + window.localStorage.getItem('token'), (rs) => {
            if (rs.code != '0') {
                this.orders = rs.data.data;
                this.orders.forEach(order => {
                    $('#list-order').append('<li class="list-group-item">#' + order.id + ' thiết bị: ' + order.deviceId + '</li>');
                })
            }
        })
    }
    this.loadnearestTemperature = () => {
        $.get('https://us-central1-api-project-611301476725.cloudfunctions.net/temperature/auth/list-random?accessToken=' + window.localStorage.getItem('token'), (rs) => {
            if (rs.code != '0') {
                for (const record of rs.data.data) {
                    this.records[record.atIndex] = record
                }

                this.drawChart()
            }
        })
    }

    this.routerList = () => {
        if (!window.localStorage.getItem('token')) {
            router.navigate('/login')
            return;
        }
        $('#page-container').empty();
        $('#page-container').append(this.getTemplate('list-page-template'))
        this.loadDevices();
        this.loadOrders();
        this.loadnearestTemperature();
        this.intervalId = setInterval(() => { this.loadnearestTemperature() }, 5000)
    }

    this.logOut = () => {
        clearInterval(this.intervalId);
        window.localStorage.removeItem('token')
        router.navigate('/login')
    }

    this.toDataDraw = () => {
        var data = Object.keys(this.records).map(key => {
            return this.records[key]
        }).sort((a, b) => a > b ? 1 : -1);
        var result = [
            ['time', 'tempurature', 'doorDistance']
        ];
        data.forEach(ele => {
            result.push([ele.createdDateTime, parseInt(ele.tempurature), parseInt(ele.doorDistance)])
        });
        console.log(result);
        return result;
    }

    this.drawChart = () => {
        var data = google.visualization.arrayToDataTable(this.toDataDraw())
        var options = {
            title: 'Leads',
            hAxis: { title: 'Thời gian' },
            vAxes: {
                0: {
                    title: 'Nhiệt độ'

                },
                1: {
                    title: 'Cửa',
                    viewWindow: {
                        max: 10,
                        min: 0
                    },


                },
            },
            series: {
                0: { type: 'line', targetAxisIndex: 0 },
                1: { type: 'bars', targetAxisIndex: 1 },

            },
        };
        var chart = new google.visualization.ComboChart(document.getElementById('chart_div'));
        chart.draw(data, options);
    }
};