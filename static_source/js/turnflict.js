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

function draw_units(canvas, game, theme, zoom){
    var units = game.units;
    $.each(units, function(index, unit) {
        draw_unit(canvas, theme, unit, zoom);
    });
}

function draw(canvas, game, theme, zoom, aspect_ratio){
    resize_canvas(canvas, zoom, aspect_ratio);
    draw_grid(canvas, zoom, aspect_ratio);
    draw_units(canvas, game, theme, zoom);
}

$(document).ready(function()
{
    var zoom = 20;
    var aspect_ratio = 16/9;
    var canvas = $("#gamefield")[0];

    var url = $("#couchurl").html();
    $.getJSON(url, function(data) {
        var game = data.game;
        var theme = {
            "image": $("#themesprite")[0],
            "resolution": 20
        };
        draw(canvas, game, theme, zoom, aspect_ratio);
        $(window).resize(function(){
            draw(canvas, game, theme, zoom, aspect_ratio);
        });
    });
});
