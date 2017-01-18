function partial_sums(data) {
    var count1 = 0;
    var count2 = 0;
    var humans_cumulative = [];
    var bots_cumulative = [];

    // Assumed that data.humans.length == data.bots.length
    for (var i = 0; i < data.humans.length; i+=1) {
        count1 += data.humans[i];
        humans_cumulative[i] = count1;
        count2 += data.bots[i];
        bots_cumulative[i] = count2;
    }
    return [humans_cumulative, bots_cumulative];
}

function window_sums(cumulative_sums, window_size) {
    var humans_cumulative = cumulative_sums[0];
    var bots_cumulative = cumulative_sums[1];
    var humans_windowsums = [];
    var bots_windowsums = [];

    for (var j = 0; j < humans_cumulative.length; j+=1) {
        if (j < window_size) {
            humans_windowsums[j] = humans_cumulative[j];
            bots_windowsums[j] = bots_cumulative[j];
        } else {
            humans_windowsums[j] = humans_cumulative[j] - humans_cumulative[j-window_size];
            bots_windowsums[j] = bots_cumulative[j] - bots_cumulative[j-window_size];
        }
    }
    return [humans_windowsums, bots_windowsums];
}

function make_bar_trace(data, y, name, hoverinfo, text) {
    var trace = {
        x: data.end_times.map(function (timestamp) {
            return new Date(timestamp*1000);
        }),
        y: y,
        type: 'bar',
        name: name,
        hoverinfo: hoverinfo,
        text: text,
    };
    return trace;
}

// returns mm/dd/yyyy for now
function format_date(date_object) {
    var month_abbreviations = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    var date = date_object;
    var day = date.getDate();
    var month = date.getMonth();
    var hour = date.getHours();
    var hour_12;
    var suffix;
    if (hour == 0){
        suffix = ' AM';
        hour_12 = 12;
    } else if (hour == 12){
        suffix = ' PM';
        hour_12 = hour;
    } else if (hour < 12){
        suffix = ' AM';
        hour_12 = hour;
    } else {
        suffix = 'PM';
        hour_12 = hour-12
    }
    return month_abbreviations[month] + ' ' + day + ', ' + hour_12 + suffix;

}

function date_ranges_for_hover(trace_x, window_size) {
    var date_ranges = [];
    for (var j = 0; j < trace_x.length; j+=1) {
        var beginning = format_date(trace_x[0]);
        var today;
        if (j < window_size) {
            today = format_date(trace_x[j]);
            date_ranges[j] = beginning + '-' + today;
        } else {
            beginning = format_date(trace_x[j-window_size]);
            today = format_date(trace_x[j]);
            date_ranges[j] = beginning + ' - ' + today;
        }
    }
    return date_ranges;
}

function populate_messages_sent_to_realm_bar(data) {

    var trace_humans = make_bar_trace(data, data.humans, "Humans", 'x+y', '');
    var trace_bots = make_bar_trace(data, data.bots, "Bots", 'x+y', '');

    var cumulative_sums = partial_sums(data);
    var humans_cumulative = cumulative_sums[0];
    var bots_cumulative = cumulative_sums[1];
    var trace_humans_cumulative = make_bar_trace(data, humans_cumulative, "Humans", 'x+y', '');
    var trace_bots_cumulative = make_bar_trace(data, bots_cumulative, "Bots", 'x+y', '');

    var weekly_sums = window_sums(cumulative_sums, 7*24);
    var humans_weekly = weekly_sums[0];
    var bots_weekly = weekly_sums[1];
    var date_range_weekly = date_ranges_for_hover(trace_humans.x, 7*24);
    var trace_humans_weekly = make_bar_trace(data, humans_weekly, "Humans", 'y+text', date_range_weekly);
    var trace_bots_weekly = make_bar_trace(data, bots_weekly, "Bots", 'y+text', date_range_weekly);

    var daily_sums = window_sums(cumulative_sums, 24);
    var humans_daily = daily_sums[0];
    var bots_daily = daily_sums[1];
    var date_range_daily = date_ranges_for_hover(trace_humans.x, 24);
    var trace_humans_daily = make_bar_trace(data, humans_daily, "Humans", 'y+text', date_range_daily);
    var trace_bots_daily = make_bar_trace(data, bots_daily, "Bots", 'y+text', date_range_daily);


    var layout = {
        barmode:'group',
        width: 900,
        margin: {
            l: 40, r: 0, b: 40, t: 0,
        },
        xaxis: {
            rangeselector: {
                x: 0.65,
                y: -0.7,
                buttons: [
                    {count:10,
                         label:'Last 10 Days',
                         step:'day',
                         stepmode:'backward'},
                    {count:30,
                        label:'Last 30 Days',
                        step:'day',
                        stepmode:'backward'},
                    {
                        step:'all',
                        label: 'All time',
                    },
                ],
            },
            rangeslider:{},
            type: 'date',
        },
        yaxis: {
            fixedrange: true,
            rangemode: 'tozero',
        },
    };
    Plotly.newPlot('id_messages_sent_to_realm_bar',
                   [trace_humans, trace_bots], layout, {displayModeBar: false});

    $('#cumulative_button').click(function () {
        $(this).css('background', '#D8D8D8');
        $('#daily_button').css('background', '#F0F0F0');
        $('#weekly_button').css('background', '#F0F0F0');
        $('#hourly_button').css('background', '#F0F0F0');
        Plotly.deleteTraces('id_messages_sent_to_realm_bar', [0,1]);
        Plotly.addTraces('id_messages_sent_to_realm_bar', [trace_humans_cumulative, trace_bots_cumulative]);
    });

    $('#daily_button').click(function () {
        $(this).css('background', '#D8D8D8');
        $('#cumulative_button').css('background', '#F0F0F0');
        $('#weekly_button').css('background', '#F0F0F0');
        $('#hourly_button').css('background', '#F0F0F0');
        Plotly.deleteTraces('id_messages_sent_to_realm_bar', [0,1]);
        Plotly.addTraces('id_messages_sent_to_realm_bar', [trace_humans_daily, trace_bots_daily]);
    });

    $('#weekly_button').click(function () {
        $(this).css('background', '#D8D8D8');
        $('#daily_button').css('background', '#F0F0F0');
        $('#cumulative_button').css('background', '#F0F0F0');
        $('#hourly_button').css('background', '#F0F0F0');
        Plotly.deleteTraces('id_messages_sent_to_realm_bar', [0,1]);
        Plotly.addTraces('id_messages_sent_to_realm_bar', [trace_humans_weekly, trace_bots_weekly]);
    });

    $('#hourly_button').click(function () {
        $(this).css('background', '#D8D8D8');
        $('#daily_button').css('background', '#F0F0F0');
        $('#weekly_button').css('background', '#F0F0F0');
        $('#cumulative_button').css('background', '#F0F0F0');
        Plotly.deleteTraces('id_messages_sent_to_realm_bar', [0,1]);
        Plotly.addTraces('id_messages_sent_to_realm_bar', [trace_humans, trace_bots]);
    });

    var myPlot = document.getElementById('id_messages_sent_to_realm_bar');
    var hoverInfo = document.getElementById('hoverinfo');
    myPlot.on('plotly_hover', function (data) {
        var date_range;
        var infotext = data.points.map(function (d) {
            var text = d.data.text;
            var index = data.points[0].pointNumber;
            if (text === '') {
                date_range = format_date(d.data.x[index]);
            } else {
                date_range = d.data.text[index];
            }
            return (d.data.name + ': ' + d.y);
        });
        hoverInfo.innerHTML = 'Date range: '+ date_range + '<br/>' + infotext.join('<br/>');
    });

}

$.get({
    url: '/json/analytics/chart_data',
    data: {chart_name: 'messages_sent_by_humans_and_bots', min_length: '10'},
    idempotent: true,
    success: function (data) {
        populate_messages_sent_to_realm_bar(data);
    },
    error: function (xhr) {
        $('#id_stats_errors').text($.parseJSON(xhr.responseText).msg);
    },
});

function populate_number_of_users(data) {
    var trace_humans = make_bar_trace(data, data.humans, "Active users", 'x+y', true, '');

    var layout = {
        width: 800,
        height: 370,
        margin: {
            l: 0, r: 0, b: 0, t: 20,
        },
        xaxis: {
            rangeselector: {
                x: 0.75,
                y:-0.2,
                buttons: [
                    {count:30,
                        label:'Last 30 Days',
                        step:'day',
                        stepmode:'backward'},
                    {
                        step:'all',
                        label: 'All time',
                    },
                ],
            },
        },
        yaxis: {
            fixedrange: true,
            rangemode: 'tozero',
        },
    };
    Plotly.newPlot('id_number_of_users',
                   [trace_humans], layout, {displayModeBar: false});
}

$.get({
    url: '/json/analytics/chart_data',
    data: {chart_name: 'number_of_humans', min_length: '10'},
    idempotent: true,
    success: function (data) {
        populate_number_of_users(data);
    },
    error: function (xhr) {
        $('#id_stats_errors').text($.parseJSON(xhr.responseText).msg);
    },
});

function get_values_and_labels(categories, user_or_realm_data, name_directory) {
    var values = [];
    var labels = [];
    for (var i = 0; i < categories.length; i+=1) {
        if (user_or_realm_data[i] > 0) {
            values.push(user_or_realm_data[i]);
            labels.push(name_directory[categories[i]]);
        }
    }
    return [values, labels];
}

function make_pie_trace(data, values, labels) {
    var trace = [{
        values: values,
        labels: labels,
        type: 'pie',
        direction: 'clockwise',
        rotation: -180,
        sort: true,
    }];
    return trace;
}

function populate_messages_sent_by_client(data) {
    var names = {
        electron_: "Electron",
        barnowl_: "BarnOwl",
        website_: "Website",
        API_: "API",
        android_: "Android",
        iOS_: "iOS",
        react_native_: "React Native",
    };
    var categories = data.clients.map(function (x) {
        return x.name;
    });
    var realm_values = get_values_and_labels(categories, data.realm, names)[0];
    var realm_labels = get_values_and_labels(categories, data.realm, names)[1];
    var user_values = get_values_and_labels(categories, data.user, names)[0];
    var user_labels = get_values_and_labels(categories, data.user, names)[1];

    var trace_realm = make_pie_trace(data, realm_values, realm_labels);
    var layout = {
        margin: {
            l: 0, r: 0, b: 50, t: 30,
        },
        width: 500,
        height: 400,
    };
    Plotly.newPlot('id_messages_sent_by_client',
                   trace_realm, layout, {displayModeBar: false});

    $('#messages_by_client_realm_button').click(function () {
        $(this).css('background', '#D8D8D8');
        $('#messages_by_client_user_button').css('background', '#F0F0F0');
        var plotDiv = document.getElementById('id_messages_sent_by_client');
        plotDiv.data[0].values = realm_values;
        plotDiv.data[0].labels = realm_labels;
        Plotly.redraw('id_messages_sent_by_client');
    });
    $('#messages_by_client_user_button').click(function () {
        $(this).css('background', '#D8D8D8');
        $('#messages_by_client_realm_button').css('background', '#F0F0F0');
        var plotDiv = document.getElementById('id_messages_sent_by_client');
        plotDiv.data[0].values = user_values;
        plotDiv.data[0].labels = user_labels;
        Plotly.redraw('id_messages_sent_by_client');
    });
}

$.get({
    url: '/json/analytics/chart_data',
    data: {chart_name: 'messages_sent_by_client', min_length: '10'},
    idempotent: true,
    success: function (data) {
        populate_messages_sent_by_client(data);
    },
    error: function (xhr) {
        $('#id_stats_errors').text($.parseJSON(xhr.responseText).msg);
    },
});

function populate_messages_sent_by_message_type(data) {
    var names = {
        public_stream: "Public Stream",
        private_stream: "Private Stream",
        private_message: "Private Message",
    };
    var realm_values = get_values_and_labels(data.message_types, data.realm, names)[0];
    var realm_labels = get_values_and_labels(data.message_types, data.realm, names)[1];
    var user_values = get_values_and_labels(data.message_types, data.user, names)[0];
    var user_labels = get_values_and_labels(data.message_types, data.user, names)[1];

    var trace_realm = make_pie_trace(data, realm_values, realm_labels);
    var layout = {
        margin: {
            l: 0, r: 0, b: 50, t: 30,
        },
        width: 500,
        height: 400,
    };
    Plotly.newPlot('id_messages_sent_by_message_type',
                   trace_realm, layout, {displayModeBar: false});

    $('#messages_by_type_realm_button').click(function () {
        $(this).css('background', '#D8D8D8');
        $('#messages_by_type_user_button').css('background', '#F0F0F0');
        var plotDiv = document.getElementById('id_messages_sent_by_message_type');
        plotDiv.data[0].values = realm_values;
        plotDiv.data[0].labels = realm_labels;
        Plotly.redraw('id_messages_sent_by_message_type');
    });
    $('#messages_by_type_user_button').click(function () {
        $(this).css('background', '#D8D8D8');
        $('#messages_by_type_realm_button').css('background', '#F0F0F0');
        var plotDiv = document.getElementById('id_messages_sent_by_message_type');
        plotDiv.data[0].values = user_values;
        plotDiv.data[0].labels = user_labels;
        Plotly.redraw('id_messages_sent_by_message_type');
    });
}

$.get({
    url: '/json/analytics/chart_data',
    data: {chart_name: 'messages_sent_by_message_type', min_length: '10'},
    idempotent: true,
    success: function (data) {
        populate_messages_sent_by_message_type(data);
    },
    error: function (xhr) {
        $('#id_stats_errors').text($.parseJSON(xhr.responseText).msg);
    },
});
