s//define a datapoint that contains:
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

	var style = this.style = "rgba(255,255,255,255)";
};

Datapoint.prototype.moveTarget = function( x, y ){
	this.targetBody.setPos(v(x, y));
};

Datapoint.prototype.draw = function(ctx, scale, point2canvas) {

	//ensure collision radius is correct
	this.shape.r = this.radius;
	this.body.r = this.radius;

	//draw the shape with the correct style
	var c = point2canvas(this.shape.tc);	
	ctx.beginPath();
		ctx.strokeStyle="rgba(0,0,0,255)";
		ctx.fillStyle = this.style;

		ctx.arc(c.x, c.y, scale * this.radius, 0, 2*Math.PI, false);
		ctx.fill();
		ctx.stroke();
	ctx.closePath();
};

cp.Shape.prototype.pairDataPoint = function(d) {
	this.dataPoint = d;
};