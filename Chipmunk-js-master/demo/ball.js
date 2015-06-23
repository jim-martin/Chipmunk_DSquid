var dataPoints = {};
var headers = [];
var bodies = [];

xSelect = document.getElementById('xAxis');
ySelect = document.getElementById('yAxis');

function init_graph() {
    //draw two selectors for axes
    for (var i = 1; i < headers.length; i++) {
        xSelect.options[i - 1] = new Option(headers[i], headers[i]);
        ySelect.options[i - 1] = new Option(headers[i], headers[i]);
    }

    //change one of them to not be sector #
    first_draw();
}

function clean_datapoint(a){
    a = a.split(" ").join("");
    a = a.split("$").join("");
    a = a.split("\"").join("");
    a = a.split("%").join("");
    if (a == "N/A") //default N/A's to 0
        a = 0;

    a = Number(a);

    return a;
}

function redraw_graph() {
    var x_var = xSelect.options[xSelect.selectedIndex].value;
    var y_var = ySelect.options[ySelect.selectedIndex].value;
    console.log("x_var: " + x_var);
    console.log("y_var: " + y_var);

    //get all data bodies
    dataKeys = Object.keys(dataPoints);
    for (var i = 0; i < dataKeys.length; i++) {
        var radius = 5;
        mass = 3;
        var body = bodies[i];

        xPos = dataPoints[dataKeys[i]][x_var];
        yPos = dataPoints[dataKeys[i]][y_var];

        xPos = clean_datapoint(xPos);
        yPos = clean_datapoint(yPos);

        //console.log("xPos (post number): " + xPos);
        //console.log("yPos (post number): " + yPos);
        body.setPos(v(xPos, yPos));
    }
}

function first_draw() {
    var x_var = xSelect.options[xSelect.selectedIndex].value;
    var y_var = ySelect.options[ySelect.selectedIndex].value;
    console.log("x_var: " + x_var);
    console.log("y_var: " + y_var);

    dataKeys = Object.keys(dataPoints);
    xScale = 0;
    yScale = 0;
    for (var i = 0; i < dataKeys.length; i++) {
        //rescale
        xPos = dataPoints[dataKeys[i]][x_var];
        yPos = dataPoints[dataKeys[i]][y_var];

        if(xPos > xScale){
            xScale = xPos;
        }
        if(yPos > yScale){
            yScale = yPos;
        }
    }
    for (var i = 0; i < dataKeys.length; i++) {
        //for (var i = 0; i < 1; i++) {
        var radius = 5;
        mass = 3;
        var body = space.addBody(new cp.Body(mass, cp.momentForCircle(mass, 0, radius, v(0, 0))));
        bodies.push(body);
        console.log(body);
        xPos = dataPoints[dataKeys[i]][x_var];
        yPos = dataPoints[dataKeys[i]][y_var];

        xPos = clean_datapoint(xPos);
        yPos = clean_datapoint(yPos);


        //console.log("xPos (post number): " + xPos);
        //console.log("yPos (post number): " + yPos);
        body.setPos(v(xPos, yPos));
        var circle = space.addShape(new cp.CircleShape(body, radius, v(0, 0)));

        circle.setElasticity(0.8);
        circle.setFriction(0);
    }
}

var Balls = function () {
    Demo.call(this);

    if (window.jQuery) {
        console.log("jquery is loaded");
    }
    else {
        console.log("jquery is NOT loaded");
    }

    var space = this.space;
    space.iterations = 60;
    space.gravity = v(0, 0);
    space.sleepTimeThreshold = 0.5;
    space.collisionSlop = 0.5;
    space.sleepTimeThreshold = 0.5;

    //this.addFloor();
    //this.addWalls();

    //var width = 50;
    //var height = 60;
    //var mass = width * height * 1/1000;
    //var rock = space.addBody(new cp.Body(mass, cp.momentForBox(mass, width, height)));
    //rock.setPos(v(500, 100));
    //rock.setAngle(1);
    //shape = space.addShape(new cp.BoxShape(rock, width, height));
    //shape.setFriction(0.3);
    //shape.setElasticity(0.3);

    //read in CSV file
    //parse into JSON
    //based on selected attributes
    //draw each point


    $.ajax({
        url: "data/pghsnap_education.csv",
        dataType: "text",
        success: function (result) {
            console.log(result);
            //parse first line to define fields of object
            var lines = result.split('\n');
            console.log(lines[0]);
            headers = lines[0].split(',');

            //rest of rows parse into dataPoints object
            for (var i = 1; i < lines.length; i++) {
                curLine = lines[i].split(',');
                dataPoints[curLine[0]] = {};
                for (var j = 0; j < curLine.length; j++) {
                    dataPoints[curLine[0]][headers[j]] = curLine[j];
                }
            }

            console.log(dataPoints);

            //draw the graph
            init_graph();
        }

    });


    /*
     * atom.canvas.onmousedown = function(e) {
     radius = 10;
     mass = 3;
     body = space.addBody(new cp.Body(mass, cp.momentForCircle(mass, 0, radius, v(0, 0))));
     body.setPos(v(e.clientX, e.clientY));
     circle = space.addShape(new cp.CircleShape(body, radius, v(0, 0)));
     circle.setElasticity(0.5);
     return circle.setFriction(1);
     };
     */

    //this.ctx.strokeStyle = "black";

    //var ramp = space.addShape(new cp.SegmentShape(space.staticBody, v(100, 100), v(300, 200), 10));
    //ramp.setElasticity(1);
    //ramp.setFriction(1);
    //ramp.setLayers(NOT_GRABABLE_MASK);
};

Balls.prototype = Object.create(Demo.prototype);

addDemo('Balls', Balls);

