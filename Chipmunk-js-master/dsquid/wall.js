/*
Lense object
 */
var Wall = function(s, centerX, centerY, rad){
//if radius == 0 then it is global


	var space = this.space = s;
	var center = this.center = v(centerX, centerY);
	var radius = this.radius = rad + 0.01;
	var mass = 10000;

	var body = this.body = space.addBody(new cp.Body(mass, cp.momentForCircle(mass, 0, radius, v(0, 0))));
		body.setPos(center); //this is a hack to ensure the attractor isn't at length 0 

	var shape = this.shape = space.addShape(new cp.CircleShape(body, radius, v(0, 0)));
		shape.setSensor(false);
		shape.type = "wall";
		shape.wall = this;

    var filterList = this.filterList = [];

    this.addFilter(Filter());
    fuiController.wallsList.push(this);

    var mask_bit = this.mask_bit = 1<<(fuiController.wallsList.length);
    shape.setLayers( mask_bit );

};

Wall.prototype.updateSize = function(rad) {
	this.radius = rad;
	this.shape.r = rad;
	this.body.r = rad;
};

Wall.prototype.getPoints = function() {
	var returnVal = [];
	//look through all datapoints 
	this.space.shapeQuery(this.shape, function(b, set){
		returnVal.push(b.datapoint);
	});
	
	//return the points inside bounds
	return returnVal;
	
};

Wall.prototype.draw = function(ctx, scale, point2canvas) {

	//console.log("drawinglense");
	//draw shape based on lense style? nahh, hard code dat shit
	var c = point2canvas(this.center);
	ctx.strokeStyle="rgba(0,0,0,255)";
	ctx.fillStyle="rgba(255,255,255,255)";
	ctx.beginPath();
	ctx.arc(c.x, c.y, scale * this.radius, 0, 2*Math.PI, false);
	ctx.stroke();
	ctx.closePath();
};

Wall.prototype.addFilter = function(filter) {
	//add a filter here
    this.filterList.push(filter);
};

Wall.prototype.callFilters = function(){
    //iterate through all filters
    var disabled = [];
    for(var i = 0; i < this.filterList.length; i++){
        //get disabled[] from all of the filters
        disabled = this.filterList[i].filter_points().enabled;

        console.log(disabled);
        //console.log(this.mask_bit.toString(2));



        //change collision mask based on filters
        for(var j = 0; j < disabled.length; j++){

        	disabled[j].mask_bit = disabled[j].shape.layers | this.mask_bit;
        	disabled[j].shape.setLayers(disabled[j].mask_bit);

        }

    }
}