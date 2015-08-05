//define a datapoint that contains:
//	- the shape/body to be drawn
//	- an attractor that connects the shape/body to the targetBody
//	- a targetBody that represents the proper location of the data(connected to attractor)
var Datapoint = function( s , targetx, targety ) {
	var space = this.space = s;

	var radius = this.radius = 4;
	var mass = this.mass = 3;

	var body = this.body = space.addBody(new cp.Body(mass, cp.momentForCircle(mass, 0, radius, v(0, 0))));
		body.setPos(v(targetx + 0.1, targety + 0.1)); //this is a hack to ensure the attractor isn't at length 0 

	var shape = this.shape = space.addShape(new cp.CircleShape(body, radius, v(0, 0)));
		shape.setElasticity(0.8);
		shape.setFriction(1);
		shape.datapoint = this;
		shape.type = "datapoint";


	//define targetbody
	var targetBody = this.targetBody = new cp.Body(Infinity, Infinity);
	targetBody.setPos(v(targetx, targety));

	// //add attractor
	var attractor = this.attractor = new cp.AttractorJoint(targetBody, body);
	space.addConstraint(attractor);

	var style = this.style = "rgba(0,255,0,255)";

    var red = this.red = 0;
    var green = this.green = 255;
    var blue = this.blue = 0;
    var alpha = this.alpha = 1;
    var highlighted = this.highlighted = false;
    var filteredOut = this.filteredOut = false;

    var mask_bit = this.mask_bit = DATAPOINT_MASK_BIT;
};

Datapoint.prototype.moveTarget = function( x, y ){
	this.targetBody.setPos(v(x, y));
};

Datapoint.prototype.getStyle = function(){
    var curRed = this.red;
    var curGreen = this.green;
    var curBlue = this.blue;
    var curAlpha = this.alpha;

    //make hot pink if highlighted
    if(this.highlighted == true){
        curRed = 255;
        curGreen = 20;
        curBlue = 147;
    }

    //make translucent if filteredOut
    if(this.filteredOut == true){
        curAlpha = .1;
    }
    //this.style = "rgba("+curRed+","+curGreen+","+curBlue+","+curAlpha+")";
    return "rgba("+curRed+","+curGreen+","+curBlue+","+curAlpha+")";
}


Datapoint.prototype.draw = function(ctx, scale, point2canvas) {

	//ensure collision radius is correct
	this.shape.r = this.radius;
	this.body.r = this.radius;

	//draw the shape with the correct style
	var c = point2canvas(this.shape.tc);	
	ctx.beginPath();
		ctx.strokeStyle="rgba(0,0,0,255)";

		ctx.fillStyle = this.getStyle();

		ctx.arc(c.x, c.y, scale * this.radius, 0, 2*Math.PI, false);
		ctx.fill();
		ctx.stroke();
	ctx.closePath();
};

cp.Shape.prototype.pairDataPoint = function(d) {
	this.dataPoint = d;
};

function clean_all_datapoints(){

    //console.log("cleaning datapoints");

    for(var i = 0; i < datapoints.length; i++){
        datapoints[i].filteredOut = false;
        datapoints[i].highlighted = false;

        //for wall
        datapoints[i].mask_bit = DATAPOINT_MASK_BIT;
    }
}