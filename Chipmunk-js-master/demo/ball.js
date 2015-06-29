var pointsData = {};
var headers = [];
var bodies = [];
var attractors = [];
var xScale = 0;
var yScale = 0;

var target_index;

var view_sequence = [];

xSelect = document.getElementById('xAxis');
ySelect = document.getElementById('yAxis');

function init_graph() {
    //draw two selectors for axes
    for (var i = 1; i < headers.length; i++) {
        xSelect.options[i - 1] = new Option(headers[i], headers[i]);
        ySelect.options[i - 1] = new Option(headers[i], headers[i]);
    }

    //change one of them to not be sector #
    position_points();
}

function clean_datapoint(a){
    a = a.split(" ").join("");
    a = a.split("$").join("");
    a = a.split("\"").join("");
    a = a.split("%").join("");
    a = a.split(",").join("");
    if (a == "N/A") //default N/A's to 0
        a = 0;

    a = Number(a);

    return a;
}

function get_shape_info(index){
    dataKeys = Object.keys(pointsData);
    console.log(pointsData[dataKeys[index]]);
}

//rescale
function set_scale(){
    var x_var = xSelect.options[xSelect.selectedIndex].value;
    var y_var = ySelect.options[ySelect.selectedIndex].value;
    xScale = 0;
    yScale = 0;

    for (var i = 0; i < datapoints.length; i++) {
        xPos = datapoints[i].fields[x_var];
        yPos = datapoints[i].fields[y_var];


        if(xPos > xScale){
            xScale = xPos;
        }
        if(yPos > yScale){
            yScale = yPos;
        }
    }
    //console.log("xScale: "+xScale);
    //console.log("yScale: "+yScale);
}

function position_points() {
    var x_var = xSelect.options[xSelect.selectedIndex].value;
    var y_var = ySelect.options[ySelect.selectedIndex].value;
    console.log("x_var: " + x_var);
    console.log("y_var: " + y_var);

    dataKeys = Object.keys(pointsData);

    set_scale();

    for (var i = 0; i < datapoints.length; i++) {
        xPos = datapoints[i].fields[x_var];
        yPos = datapoints[i].fields[y_var];
        datapoints[i].moveTarget(xPos * 580/xScale + 20, yPos * 380/ yScale + 20);
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
    space.damping = .001;

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
            //var lines = result.split('\n');
            //console.log(lines[0]);
            //headers = lines[0].split(',');

            csv_array = CSVToArray(result);
            console.log(csv_array);

            //rest of rows parse into pointsData object
            //for (var i = 1; i < lines.length; i++) {
            //    curLine = lines[i].split(',');
            //    console.log(curLine);
            //    pointsData[curLine[0]] = {};
            //    for (var j = 0; j < curLine.length; j++) {
            //        pointsData[curLine[0]][headers[j]] = curLine[j];
            //    }
            //}

            headers = csv_array[0];

            for(var i = 1; i < csv_array.length; i++){
                curLine = csv_array[i];
                pointsData[curLine[0]] = {};
                if(curLine[0] == "Shadyside"){
                    target_index = i;
                    console.log(target_index);
                }
                for(var j = 0; j < curLine.length; j++){
                    //console.log(curLine[j]);
                    //console.log(clean_datapoint(curLine[j]));
                    if(j > 0){
                        pointsData[curLine[0]][headers[j]] = clean_datapoint(curLine[j]);
                    }
                    else{
                        pointsData[curLine[0]][headers[j]] = curLine[j];
                    }
                }


                var point = new Datapoint(space, 0, 0);
                point.fields = pointsData[curLine[0]];
                datapoints.push(point);
            }
            console.log("datapoints:");
            console.log(datapoints);
            console.log(pointsData);


            //draw the graph
            init_graph();
        }

    });

    //from http://www.bennadel.com/blog/1504-ask-ben-parsing-csv-strings-with-javascript-exec-regular-expression-command.htm
    // This will parse a delimited string into an array of
    // arrays. The default delimiter is the comma, but this
    // can be overriden in the second argument.
    function CSVToArray( strData, strDelimiter ){
        // Check to see if the delimiter is defined. If not,
        // then default to comma.
        strDelimiter = (strDelimiter || ",");

        // Create a regular expression to parse the CSV values.
        var objPattern = new RegExp(
            (
                // Delimiters.
            "(\\" + strDelimiter + "|\\r?\\n|\\r|^)" +

                // Quoted fields.
            "(?:\"([^\"]*(?:\"\"[^\"]*)*)\"|" +

                // Standard fields.
            "([^\"\\" + strDelimiter + "\\r\\n]*))"
            ),
            "gi"
        );


        // Create an array to hold our data. Give the array
        // a default empty first row.
        var arrData = [[]];

        // Create an array to hold our individual pattern
        // matching groups.
        var arrMatches = null;


        // Keep looping over the regular expression matches
        // until we can no longer find a match.
        while (arrMatches = objPattern.exec( strData )){

            // Get the delimiter that was found.
            var strMatchedDelimiter = arrMatches[ 1 ];

            // Check to see if the given delimiter has a length
            // (is not the start of string) and if it matches
            // field delimiter. If id does not, then we know
            // that this delimiter is a row delimiter.
            if (
                strMatchedDelimiter.length &&
                (strMatchedDelimiter != strDelimiter)
            ){

                // Since we have reached a new row of data,
                // add an empty row to our data array.
                arrData.push( [] );

            }


            // Now that we have our delimiter out of the way,
            // let's check to see which kind of value we
            // captured (quoted or unquoted).
            if (arrMatches[ 2 ]){

                // We found a quoted value. When we capture
                // this value, unescape any double quotes.
                var strMatchedValue = arrMatches[ 2 ].replace(
                    new RegExp( "\"\"", "g" ),
                    "\""
                );

            } else {

                // We found a non-quoted value.
                var strMatchedValue = arrMatches[ 3 ];

            }


            // Now that we have our value string, let's add
            // it to the data array.
            arrData[ arrData.length - 1 ].push( strMatchedValue );
        }

        // Return the parsed data.
        return( arrData );
    }


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

