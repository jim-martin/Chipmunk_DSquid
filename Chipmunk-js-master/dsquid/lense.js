/*
Lense object
 */
var Lense = function(s, centerX, centerY, rad){
//if radius == 0 then it is global


	var space = this.space = s;
	var center = this.center = v(centerX, centerY);
	var radius = this.radius = rad + 0.01;
	var mass = 1;

	var body = this.body = space.addBody(new cp.Body(mass, cp.momentForCircle(mass, 0, radius, v(0, 0))));
		body.setPos(center); //this is a hack to ensure the attractor isn't at length 0 

	var shape = this.shape = space.addShape(new cp.CircleShape(body, radius, v(0, 0)));
		shape.setSensor(true);

    var filterList = this.filterList = [];

    this.addFilter();

	//lenses.push(this);

};

Lense.prototype.updateSize = function(rad) {
	this.radius = rad;
	this.shape.r = rad;
	this.body.r = rad;
};

Lense.prototype.getPoints = function() {
	//look through all datapoints 

	//return the points inside bounds
	
};

Lense.prototype.draw = function(ctx, scale, point2canvas) {

	//console.log("drawinglense");

	//draw shape based on lense style? nahh, hard code dat shit
	var c = point2canvas(this.center);
	ctx.beginPath();
	ctx.arc(c.x, c.y, scale * this.radius, 0, 2*Math.PI, false);
	ctx.stroke();

};

Lense.prototype.addFilter = function() {
	//add a filter here
    this.filterList.push(Filter());
    console.log(this);
};

Lense.prototype.callFilters = function(){
    //iterate through all filters
    var disabled = [];
    for(var i = 0; i < this.filterList.length; i++){
        //get disabled[] from all of the filters
        disabled = this.filterList[i].filter_points().disabled;
        console.log(disabled);

        //change styling on disabled points
        for(var j = 0; j < disabled.length; j++){
            console.log(disabled[i]);

            var colorString = "rgb(0,255,0)";
            disabled[j].shape.colorstring = colorString;

            newstyle = function(){
                return this.colorstring;
            }
            disabled[j].redraw(newstyle);
        }
    }
}