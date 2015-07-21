/*
Lense object
 */
var Lense = function(s, centerX, centerY, rad){

	var space = this.space = s;
	var center = this.center = v(centerX, centerY);
	var radius = this.radius = rad + 0.01;
	var mass = 10000;

	var body = this.body = space.addBody(new cp.Body(mass, cp.momentForCircle(mass, 0, radius, v(0, 0))));
		body.setPos(center); //this is a hack to ensure the attractor isn't at length 0 

	var shape = this.shape = space.addShape(new cp.CircleShape(body, radius, v(0, 0)));
		shape.setSensor(true);

	//lenses.push(this);
};

Lense.prototype.updateSize = function(rad) {
	this.radius = rad;
	this.shape.r = rad;
	this.body.r = rad;
};

Lense.prototype.getPoints = function() {
	//look through all datapoints 
	this.space.shapeQuery(this.shape, function(b, set){
		console.log(b);
		b.setStyle(255, 0, 0, 255);
	});

	this.space.eachShape(function(shape) {
		console.log(shape.getStyle());
	});
	
	//return the points inside bounds
	
};

Lense.prototype.draw = function(ctx, scale, point2canvas) {

	//draw shape based on lense style? nahh, hard code dat shit
	var c = point2canvas(this.center);
	ctx.beginPath();
	ctx.arc(c.x, c.y, scale * this.radius, 0, 2*Math.PI, false);
	ctx.stroke();
	ctx.closePath();

};

Lense.prototype.addFilter = function() {
	//add a filter here
};