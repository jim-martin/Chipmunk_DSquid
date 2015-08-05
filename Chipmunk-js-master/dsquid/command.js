var Command = {

	execute : function(){

		throw "No execute function associated with this command";

	},

	undo : function(){

		throw "No undo function associated with this command";
		
	}

}

var undo_stack = function(){

	var commands = this.commands = [];
	var currentStep = this.currentStep = 0;

}

undo_stack.prototype.StepForward = function(){

	if( this.commands[this.currentStep]  != null ){
		this.commands[this.currentStep].execute();
		this.currentStep++;

	}else{
		console.log( "No commands - reached top of stack");
	}

}

undo_stack.prototype.StepBackward = function(){

	console.log(this);

	if( this.commands[this.currentStep - 1]  != null ){
		this.commands[this.currentStep - 1].undo();
		this.currentStep--;

	}else{
		console.log( "No commands - reached bottom of stack");
	}

}

undo_stack.prototype.PushCommand = function( command ){

	//remove all entries after the current step
	var popCount = this.commands.length - this.currentStep;
	for (var i = 0; i < popCount; i++) {
		this.commands.pop();
	};
	//add the current action to the top of the stack
	this.commands.push( command );
	command.execute();
	this.currentStep++;

}

var stack = new undo_stack();