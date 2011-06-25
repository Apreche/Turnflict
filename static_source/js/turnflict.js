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
            new_active_unit = unit;
        }
    });
    if (new_active_unit) {
        active_unit = new_active_unit;
    }else if (active_unit){
        var required_mp = distance(active_unit.x, active_unit.y, coordinates.x, coordinates.y);
        var available_mp = active_unit.movement;
        if( available_mp > required_mp ){
            $.each(game.units, function(index, unit) {
                if (unit.id == active_unit.id){
                    unit.x = coordinates.x;
                    unit.y = coordinates.y;
                    unit.movement = available_mp - required_mp;
                    game.units[index] = unit;
                    command = {"command": "move", "id": unit.id, "dx": coordinates.x, "dy": coordinates.y}
                    commands.commands.push(command)
                }
            });
        }
    }
    $("#log").prepend("<p>" + coordinates.x + "," + coordinates.y + "</p>");
}

$(document).ready(function()
{
    zoom = 20;
    aspect_ratio = 16/9;
    canvas = $("#gamefield")[0];
    commands = {'commands': []};

    var url = $("#couchurl").html();
    $.getJSON(url, function(data) {
        game = data.game;
        var theme = {
            "image": $("#themesprite")[0],
            "resolution": 20
        };
        draw(canvas, game, theme, zoom, aspect_ratio);
        $(window).resize(function(){
            draw(canvas, game, theme, zoom, aspect_ratio);
        });
        canvas.addEventListener("click", function(e){
            coordinates = get_coordinates_from_click(e, canvas, zoom);
            process_click(coordinates, game, canvas);
            draw(canvas, game, theme, zoom, aspect_ratio);
        },
        false);
    });
});
