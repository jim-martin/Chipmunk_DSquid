var v = cp.v;

var ctx;

var GRABABLE_MASK_BIT = 1<<31;
var NOT_GRABABLE_MASK = ~GRABABLE_MASK_BIT;

var datapoints = [];
var lenses = [];


//utility function to call 'fn' with a delay (prolly shouldn't be global...)
var soon = function(fn) { setTimeout(fn, 1); };


//define an attractor joint
var AttractorJoint = cp.AttractorJoint = function( a, b )
{
	cp.Constraint.call(this, a, b);

	this.maxForce = 0.01;
};

AttractorJoint.prototype = Object.create(cp.Constraint.prototype);

AttractorJoint.prototype.prestep = function(dt){
	//can't seem to call this function, or it isn't called. (were does this call come from?)
};

AttractorJoint.prototype.applyImpulse = function(){
//	var mod = 0.01; //TODO: nonlinear mod based on distance (delta mag)
	var delta = v.sub(this.a.p, this.b.p);
	var impulse = this.impulse =  v.mult(delta, this.maxForce);

	var r = v(1,1);
	//apply_impulse(this.b, impulse.x, impulse.y, r); -- not accesible outside of cp
	this.b.applyImpulse(impulse, r);
};

AttractorJoint.prototype.getImpulse = function(){
	return Math.abs(this.impulse);
};


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

var Test = function() {
	var space = this.space = new cp.Space();
	this.remainder = 0;
	this.fps = 0;
	this.mouse = v(0,0);
	this.simulationTime = 0;
	this.drawTime = 0;

 	var self = this;
	var canvas2point = this.canvas2point = function(x, y) {
		return v(x / self.scale, 480 - y / self.scale);
	};

	this.point2canvas = function(point) {
			return v(point.x * self.scale, (480 - point.y) * self.scale);
	};


	// HACK HACK HACK - its awful having this here, and its going to break when we
	// have multiple tests open at the same time.
	this.canvas.onmousemove = function(e) {
		self.mouse = canvas2point(e.clientX, e.clientY);

		if(self.tempSelection != null){
			self.tempSelection.updateSize(v.dist(self.tempSelection.center, self.mouse));
		}
	};

	var mouseBody = this.mouseBody = new cp.Body(Infinity, Infinity);

	this.canvas.oncontextmenu = function(e) { return false; };

	this.canvas.onmousedown = function(e) {
		e.preventDefault();
		var rightclick = e.which === 3; // or e.button === 2;
		self.mouse = canvas2point(e.clientX, e.clientY);

		if(!rightclick && !self.mouseJoint) {
			var point = canvas2point(e.clientX, e.clientY);
		
			var shape = space.pointQueryFirst(point, GRABABLE_MASK_BIT, cp.NO_GROUP);
			if(shape){
				var body = shape.body;
				var mouseJoint = self.mouseJoint = new cp.PivotJoint(mouseBody, body, v(0,0), body.world2Local(point));

				mouseJoint.maxForce = 50000000;
				mouseJoint.errorBias = Math.pow(1 - 0.15, 60);
				space.addConstraint(mouseJoint);

				console.log(shape.datapoint);
			}else{

				//log start point of selection (also servers as bool for draw call)
				self.tempSelection = new Lense(self.space, self.mouse.x, self.mouse.y, 0);
				lenses.push(self.tempSelection);
				console.log("selectionStart");

				//start tracking selection area

			}
		}

		if(rightclick) {
			self.rightClick = true;
		}
	};

	this.canvas.onmouseup = function(e) {
		var rightclick = e.which === 3; // or e.button === 2;
		self.mouse = canvas2point(e.clientX, e.clientY);

		if(!rightclick) {
			if(self.mouseJoint) {
				space.removeConstraint(self.mouseJoint);
				self.mouseJoint = null;
			}

			if(self.tempSelection){
				//commit selection area 
				
				//stop tracking selection
				self.tempSelection.getPoints();
				self.tempSelection = null;
				console.log("selectionEnd");

			}
		}

		if(rightclick) {
			self.rightClick = false;
		}
	};
};

var canvas = Test.prototype.canvas = document.getElementsByTagName('canvas')[0];
var ctx = Test.prototype.ctx = canvas.getContext('2d');

window.onresize = function(e) {
	var width = Test.prototype.width = canvas.width = window.innerWidth;
	var height = Test.prototype.height = canvas.height = window.innerHeight;
	if (width/height > 640/480) {
		Test.prototype.scale = height / 480;
	} else {
		Test.prototype.scale = width / 640;
	}

	Test.resized = true;
};
window.onresize();

var raf = window.requestAnimationFrame
	|| window.webkitRequestAnimationFrame
	|| window.mozRequestAnimationFrame
	|| window.oRequestAnimationFrame
	|| window.msRequestAnimationFrame
	|| function(callback) {
		return window.setTimeout(callback, 1000 / 60);
	};

// These should be overridden by the test itself.
Test.prototype.update = function(dt) {
	this.space.step(dt);
};

Test.prototype.drawInfo = function() {
	var space = this.space;

	var maxWidth = this.width - 20;

	this.ctx.textAlign = 'start';
	this.ctx.textBaseline = 'alphabetic';
	this.ctx.fillStyle = "black";
	//this.ctx.fillText(this.ctx.font, 100, 100);
	var fpsStr = Math.floor(this.fps * 10) / 10;
	if (space.activeShapes.count === 0) {
		fpsStr = '--';
	}
	this.ctx.fillText("FPS: " + fpsStr, 10, 50, maxWidth);
	this.ctx.fillText("Step: " + space.stamp, 10, 80, maxWidth);

	var arbiters = space.arbiters.length;
	this.maxArbiters = this.maxArbiters ? Math.max(this.maxArbiters, arbiters) : arbiters;
	this.ctx.fillText("Arbiters: " + arbiters + " (Max: " + this.maxArbiters + ")", 10, 110, maxWidth);

	var contacts = 0;
	for(var i = 0; i < arbiters; i++) {
		contacts += space.arbiters[i].contacts.length;
	}
	this.maxContacts = this.maxContacts ? Math.max(this.maxContacts, contacts) : contacts;
	this.ctx.fillText("Contact points: " + contacts + " (Max: " + this.maxContacts + ")", 10, 140, maxWidth);
	this.ctx.fillText("Simulation time: " + this.simulationTime + " ms", 10, 170, maxWidth);
	this.ctx.fillText("Draw time: " + this.drawTime + " ms", 10, 200, maxWidth);

	if (this.message) {
		this.ctx.fillText(this.message, 10, this.height - 50, maxWidth);
	}
};


Test.prototype.draw = function() {
	var ctx = this.ctx;

	var self = this;

	// Draw shapes
	ctx.strokeStyle = 'black';
	ctx.clearRect(0, 0, this.width, this.height);

	this.ctx.font = "16px sans-serif";
	this.ctx.lineCap = 'round';

	// this.space.eachShape(function(shape) {
	// 	ctx.fillStyle = shape.style();
	// 	shape.draw(ctx, self.scale, self.point2canvas);
	// });
	
	
	for (var i = 0; i < datapoints.length; i++) {
		//ctx.save();
			datapoints[i].draw(ctx, self.scale, self.point2canvas);
		//ctx.restore();
	}


	// Draw collisions
/*  
	ctx.strokeStyle = "red";
	ctx.lineWidth = 2;

	var arbiters = this.space.arbiters;
	for (var i = 0; i < arbiters.length; i++) {
		var contacts = arbiters[i].contacts;
		for (var j = 0; j < contacts.length; j++) {
			var p = this.point2canvas(contacts[j].p);

			ctx.beginPath()
			ctx.moveTo(p.x - 2, p.y - 2);
			ctx.lineTo(p.x + 2, p.y + 2);
			ctx.stroke();

			ctx.beginPath();
			ctx.moveTo(p.x + 2, p.y - 2);
			ctx.lineTo(p.x - 2, p.y + 2);
			ctx.stroke();
		}
	}*/

	if (this.mouseJoint) {
		ctx.beginPath();
		var c = this.point2canvas(this.mouseBody.p);
		ctx.arc(c.x, c.y, this.scale * 5, 0, 2*Math.PI, false);
		ctx.fill();
		ctx.stroke();
	}

	if (this.mouseAttractors){
		ctx.beginPath();
		var c = this.point2canvas(this.mouseBody.p);
		var radius = 20.0;
		ctx.arc(c.x, c.y, radius, 0, 2*Math.PI, false);
		ctx.stroke();
	}

	this.space.eachConstraint(function(c) {
		if(c.draw) {
			c.draw(ctx, self.scale, self.point2canvas);
		}
	});

	this.drawInfo();

	for (var i = 0; i < lenses.length; i++) {
		lenses[i].draw(ctx, self.scale, self.point2canvas);
	};
};

Test.prototype.run = function() {
	this.running = true;

	var self = this;

	var lastTime = 0;
	var step = function(time) {
		self.step(time - lastTime);
		lastTime = time;

		if (self.running) {
			raf(step);
		}
	};

	step(0);
};

Test.prototype.benchmark = function() {
	this.draw();

	var self = this;
	soon(function() {
		console.log("Benchmarking... waiting for the space to come to rest");
		var start = Date.now();
		while (self.space.activeShapes.count !== 0) {
			self.update(1/60);
		}
		var end = Date.now();

		console.log('took ' + (end - start) + 'ms');
		self.draw();
	});
};

Test.prototype.stop = function() {
	this.running = false;
};

Test.prototype.step = function(dt) {
	// Update FPS
	if(dt > 0) {
		this.fps = 0.9*this.fps + 0.1*(1000/dt);
	}

	// Move mouse body toward the mouse
	var newPoint = v.lerp(this.mouseBody.p, this.mouse, 0.25);
	this.mouseBody.v = v.mult(v.sub(newPoint, this.mouseBody.p), 60);
	this.mouseBody.p = newPoint;

	var lastNumActiveShapes = this.space.activeShapes.count;

	var now = Date.now();
	this.update(1/60);
	this.simulationTime += Date.now() - now;

	// Only redraw if the simulation isn't asleep.
	if (lastNumActiveShapes > 0 || Test.resized) {
		now = Date.now();
		this.draw();
		this.drawTime += Date.now() - now;
		Test.resized = false;
	}
};

Test.prototype.beginTransition = function(){
	var self = this;
	var targetShapes = [];
	this.space.eachShape(function(shape){
		targetShapes.push(shape);
	});

	//turn off collisions by placing each body on the 0 collision layer
	for (var i = 0; i < targetShapes.length; i++) {
		targetShapes[i].setLayers(0);
	}

	var fn = function(){
		self.endTransitionOnRest( targetShapes );
	};
	setTimeout(fn, 1000);
};

Test.prototype.endTransitionOnRest = function( targetShapes ){
	
	var self = this;
	var velocityThresh = 5;
	var lowVec = v(10000,10000); //hack to start the iterator off right

	var fn = function(){
		self.endTransitionOnRest( targetShapes );
	};

	//check the speed of the bodies in question, store the fastest one.
	for (var i = 0; i < targetShapes.length; i++) {
		var tempVec = v(targetShapes[i].body.vx, targetShapes[i].body.vy);
		if (v.lengthsq(tempVec) < v.lengthsq(lowVec)){
			lowVec = tempVec;
		}
	}

	if(v.lengthsq(lowVec) < velocityThresh){
		for (var i = 0; i < targetShapes.length; i++) {
			targetShapes[i].setLayers(GRABABLE_MASK_BIT);
		}
		// console.log("transition complete");
	}else{
		setTimeout(fn, 1000);
		// console.log("transition continuing");
	}


};




// Drawing helper methods

var drawCircle = function(ctx, scale, point2canvas, c, radius) {
	var c = point2canvas(c);
	ctx.beginPath();
	ctx.arc(c.x, c.y, scale * radius, 0, 2*Math.PI, false);
	ctx.fill();
	ctx.stroke();
	ctx.closePath();
};

var drawLine = function(ctx, point2canvas, a, b) {
	a = point2canvas(a); b = point2canvas(b);

	ctx.beginPath();
	ctx.moveTo(a.x, a.y);
	ctx.lineTo(b.x, b.y);
	ctx.stroke();
	ctx.closePath();
};

cp.PolyShape.prototype.draw = function(ctx, scale, point2canvas)
{
	ctx.beginPath();

	var verts = this.tVerts;
	var len = verts.length;
	var lastPoint = point2canvas(new cp.Vect(verts[len - 2], verts[len - 1]));
	ctx.moveTo(lastPoint.x, lastPoint.y);

	for(var i = 0; i < len; i+=2){
		var p = point2canvas(new cp.Vect(verts[i], verts[i+1]));
		ctx.lineTo(p.x, p.y);
	}
	ctx.fill();
	ctx.stroke();
	ctx.closePath();
};

cp.SegmentShape.prototype.draw = function(ctx, scale, point2canvas) {
	var oldLineWidth = ctx.lineWidth;
	ctx.lineWidth = Math.max(1, this.r * scale * 2);
	drawLine(ctx, point2canvas, this.ta, this.tb);
	ctx.lineWidth = oldLineWidth;
};

cp.CircleShape.prototype.draw = function(ctx, scale, point2canvas) {
	drawCircle(ctx, scale, point2canvas, this.tc, this.r);

	// And draw a little radian so you can see the circle roll.
	//drawLine(ctx, point2canvas, this.tc, cp.v.mult(this.body.rot, this.r).add(this.tc));
};

var randColor = function() {
  return Math.floor(Math.random() * 256);
};

var styles = [];
for (var i = 0; i < 100; i++) {
	styles.push("rgb(" + randColor() + ", " + randColor() + ", " + randColor() + ")");
}

// cp.Shape.prototype.setStyle = function(r, g, b, a) {
// 	this.style.r = r;
// 	this.style.g = g;
// 	this.style.b = b;
// 	this.style.a = a;
// };

// cp.Shape.prototype.getStyle = function() {
// 	return "rgba(" + this.style.r + "," + this.style.g + "," + this.style.b + "," + this.style.a + ")";
// };

cp.Shape.prototype.style = function() {
  var body;
  if (this.sensor) {
    return "rgba(255,255,255,0)";
  } else {
    body = this.body;
    if (body.isSleeping()) {
      return "rgb(50,50,50)";
    } else if (body.nodeIdleTime > this.space.sleepTimeThreshold) {
      return "rgb(170,170,170)";
    } else {
      return styles[this.hashid % styles.length];
    }
  }
};

