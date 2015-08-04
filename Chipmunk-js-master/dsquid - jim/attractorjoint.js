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