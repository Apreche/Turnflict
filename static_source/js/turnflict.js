$(document).ajaxSend(function(event, xhr, settings) {
    function getCookie(name) {
        var cookieValue = null;
        if (document.cookie && document.cookie != '') {
            var cookies = document.cookie.split(';');
            for (var i = 0; i < cookies.length; i++) {
                var cookie = jQuery.trim(cookies[i]);
                // Does this cookie string begin with the name we want?
                if (cookie.substring(0, name.length + 1) == (name + '=')) {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
        }
        return cookieValue;
    }
    function sameOrigin(url) {
        // url could be relative or scheme relative or absolute
        var host = document.location.host; // host + port
        var protocol = document.location.protocol;
        var sr_origin = '//' + host;
        var origin = protocol + sr_origin;
        // Allow absolute or scheme relative URLs to same origin
        return (url == origin || url.slice(0, origin.length + 1) == origin + '/') ||
            (url == sr_origin || url.slice(0, sr_origin.length + 1) == sr_origin + '/') ||
            // or any other URL that isn't scheme relative or absolute i.e relative.
            !(/^(\/\/|http:|https:).*/.test(url));
    }
    function safeMethod(method) {
        return (/^(GET|HEAD|OPTIONS|TRACE)$/.test(method));
    }

    if (!safeMethod(settings.type) && sameOrigin(settings.url)) {
        xhr.setRequestHeader("X-CSRFToken", getCookie('csrftoken'));
    }
});

//$("#log").prepend("<p>(" + x + "," + y + ")</p>");
var original_game;
var game;
var zoom;
var aspect_ratio;
var canvas;
var commands;
var active_unit;

function distance(sx, sy, dx, dy)
{
    return Math.abs(dx-sx) + Math.abs(dy-sy);
}

function get_unit(id)
{
    $.each(game.units, function(index, unit) {
        if (id = unit.id){
            return unit;
        }
    });
}


function resize_canvas(canvas, zoom, aspect_ratio)
{
    var max_width = $("#canvascontainer").width();
    block_width = Math.floor(max_width/zoom);
    canvas.width = block_width * zoom;
    block_height = Math.floor(block_width / aspect_ratio);
    canvas.height = block_height * zoom;
}

function draw_grid(canvas, zoom)
{
    var context = canvas.getContext("2d");
    for (var x = 0.5; x < canvas.width; x+= zoom){
        context.moveTo(x,0);
        context.lineTo(x,canvas.height);
    }
    for (var y = 0.5; y < canvas.height; y+= zoom){
        context.moveTo(0,y);
        context.lineTo(canvas.width, y);
    }
    context.strokeStyle = "#ccc";
    context.stroke();
}

function draw_unit(canvas, theme, unit, zoom)
{
    var context = canvas.getContext("2d");
    var sx = unit.type * theme.resolution;
    var sy = unit.team * theme.resolution;
    var sw = theme.resolution;
    var sh = theme.resolution;
    var dx = unit.x * zoom;
    var dy = unit.y * zoom;
    var dw = zoom;
    var dh = zoom;
    context.drawImage(theme.image, sx, sy, sw, sh, dx, dy, dw, dh);
}

function draw_units(canvas, game, theme, zoom)
{
    var units = game.units;
    $.each(units, function(index, unit) {
        draw_unit(canvas, theme, unit, zoom);
    });
}

function draw(canvas, game, theme, zoom, aspect_ratio)
{
    resize_canvas(canvas, zoom, aspect_ratio);
    draw_grid(canvas, zoom, aspect_ratio);
    draw_units(canvas, game, theme, zoom);
}

function get_offset(obj)
{
    var x = 0
        var y = 0;
    if( obj.offsetParent ){
        do {
            x += obj.offsetLeft;
            y += obj.offsetTop;
        } while (obj = obj.offsetParent);
    }
    return {'x': x, 'y': y };
}


function get_coordinates_from_click(e, canvas, zoom)
{
    var x;
    var y;
    if (e.pageX != undefined && e.pageY != undefined) {
        x = e.pageX;
        y = e.pageY;
    }
    else {
        x = e.clientX + document.body.scrollLeft +
            document.documentElement.scrollLeft;
        y = e.clientY + document.body.scrollTop +
            document.documentElement.scrollTop;
    }
    offsets = get_offset(canvas);
    x -= offsets.x;
    y -= offsets.y;
    x = Math.floor(x/zoom);
    y = Math.floor(y/zoom);
    return {'x': x, 'y': y };

}

function process_click(coordinates)
{
    var new_active_unit;
    $.each(game.units, function(index, unit) {
        if( (unit.x == coordinates.x) && (unit.y == coordinates.y )){
            var team = $("#team").html();
            if (unit.team.toString() == team) {
                new_active_unit = unit;
            }
        }
    });
    if (new_active_unit) {
        active_unit = new_active_unit;
    }else if (active_unit){
        var required_mp = distance(active_unit.x, active_unit.y, coordinates.x, coordinates.y);
        var available_mp = active_unit.movement;
        if( available_mp > required_mp ){
            var no_blocking_units = true;
            $.each(game.units, function(index, unit) {
                if (unit.id == active_unit.id){
                    $.each(game.units, function(index, other_unit){
                        if (other_unit.id != active_unit.id) {
                            if (other_unit.x == coordinates.x) {
                                if (other_unit.y == coordinates.y) {
                                    no_blocking_units = false;
                                }
                            }
                        }
                    });
                    if (no_blocking_units){
                        unit.x = coordinates.x;
                        unit.y = coordinates.y;
                        unit.movement = available_mp - required_mp;
                        game.units[index] = unit;
                        command = {"command": "move", "id": unit.id, "dx": coordinates.x, "dy": coordinates.y}
                        commands.push(command);
                    }
                }
            });
        }
    }
}

$(document).ready(function()
        {
            zoom = 20;
            aspect_ratio = 16/9;
            canvas = $("#gamefield")[0];
            commands = [];

            var url = $("#couchurl").html();
            $.getJSON(url, function(data) {
                original_game = $.extend(true, {}, data.game);
                game = $.extend(true, {}, data.game);
                var theme = {
                    "image": $("#themesprite")[0],
                "resolution": 20
                };
                draw(canvas, game, theme, zoom, aspect_ratio);

                $(window).resize(function(){
                    draw(canvas, game, theme, zoom, aspect_ratio);
                });

                canvas.addEventListener("click", function(e){
                    if ($("#allowmove").html() == "true") {
                        coordinates = get_coordinates_from_click(e, canvas, zoom);
                        process_click(coordinates, game, canvas);
                        draw(canvas, game, theme, zoom, aspect_ratio);
                    }
                },
                false);

                $("#reset").click(function(){
                    commands = [];
                    game = $.extend(true, {}, original_game);
                    draw(canvas, game, theme, zoom, aspect_ratio);
                });

                $("#endturn").click(function(){
                    var post_data = JSON.stringify({'commands': commands})
                    $.post("", {'data': post_data}, function(data){
                        original_game = $.extend(true, {}, data.game);
                        game = $.extend(true, {}, data.game);
                        draw(canvas, game, theme, zoom, aspect_ratio);
                        $("#allowmove").html("false");
                        $("#reset").hide();
                        $("#endturn").hide();
                    }, "json");
                });

            });
        });
