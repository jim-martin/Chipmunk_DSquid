

var pickerUIController = function(){

	var picker = this.picker = $("#picker");

	var xDim = this.xDim;
	var yDim = this.yDim;
	var colorDim = this.colorDim;
	var sizeDim = this.sizeDim;


	var populate_picker = this.populate_picker = function(){

		var self = this;

	    console.log("populating picker");
	    picker.html("<table width='100%'><tbody id='picker_body'><tr><th>Field</th><th>X-Axis</th><th>Y-Axis</th><th>Size</th><th>Color</th></tr></tbody></table>");
	    var picker_body = this.picker_body =  $("#picker_body");

	    //add a row to picker for each header field
	    for(var i = 1; i < headers.length; i++){
	        picker_body.append("<tr><td>"+headers[i]+"</td><td class='column1'></td><td class='column2'></td><td class='column3'></td><td class='column4'></td></tr>");
	    }

	    //set initial values for the picker and color the rows
		this.xDim = headers[1];
		this.yDim = headers[1];
		this.sizeDim = headers[1];
		this.colorDim = headers[1];
/*
		var rows = picker_body.children();
		rows = $(rows[1]).children();
		$(rows[1]).css({"background":"rgba(82, 203, 239, 0.8)"});
		$(rows[2]).css({"background":"rgba(82, 203, 239, 0.8)"});
		$(rows[3]).css({"background":"rgba(82, 203, 239, 0.8)"});
		$(rows[4]).css({"background":"rgba(82, 203, 239, 0.8)"});*/

		var default_dims = {xDim: self.xDim, yDim: self.yDim, sizeDim: self.sizeDim, colorDim: self.colorDim};
		this.position_points( default_dims );
		this.redraw_picker( default_dims );

	    $("td").on("click", function(){

	    	var target = this;

	        //store the old dimensions
	        var old_dimension = { xDim: self.xDim, yDim: self.yDim, sizeDim: self.sizeDim, colorDim: self.colorDim };

	        //change dimensions based on target of click
	        if($(target).hasClass("column1")){
	            self.xDim = $(target).siblings()[0].innerHTML;
	        }
	        if($(target).hasClass("column2")){
	            self.yDim = $(target).siblings()[0].innerHTML;
	        }
	        if($(target).hasClass("column3")){
	            self.sizeDim = $(target).siblings()[0].innerHTML;
	        }
	        if($(target).hasClass("column4")){
	            self.colorDim = $(target).siblings()[0].innerHTML;
	        }

	        //store the new dim
	        var new_dimension = { xDim: self.xDim, yDim: self.yDim, sizeDim: self.sizeDim, colorDim: self.colorDim };


	        //create a command object with the old and new dim
	        var view_command = Object.create(Command);
	            view_command.new_dim = new_dimension;
	            view_command.old_dim = old_dimension;

	        //overright the execute and undo functions of that command object with positionpoints()
	            view_command.execute = function(){
	                self.position_points(this.new_dim);
	               	self.redraw_picker(this.new_dim);
	               	self.update_dimensions(this.new_dim);
	            }

	            view_command.undo = function(){
	                self.position_points(this.old_dim);
	                self.redraw_picker(this.old_dim);
	                self.update_dimensions(this.old_dim);

	            }

	        stack.PushCommand( view_command );
	    })
	}

	var update_dimensions = this.update_dimensions = function( dimensions ){

		this.xDim = dimensions.xDim;
		this.yDim = dimensions.yDim;
		this.sizeDim = dimensions.sizeDim;
		this.colorDim = dimensions.colorDim;

	}

	var redraw_picker = this.redraw_picker = function( dimensions ){

			//reset coloring for all the columns
			$(".column1").css({"background":"none"});
			$(".column2").css({"background":"none"});
			$(".column3").css({"background":"none"});
			$(".column4").css({"background":"none"});

			//for each column, look through the headers to find the one that should be active
			for (var i = 0; i < this.picker_body.children().length; i++) {

				var target = $(this.picker_body.children()[i]).children()[0];

				if(target.innerHTML == dimensions.xDim){
					$($(this.picker_body.children()[i]).children()[1]).css({"background":"rgba(82, 203, 239, 0.8)"})
				}

				if(target.innerHTML == dimensions.yDim){
					$($(this.picker_body.children()[i]).children()[2]).css({"background":"rgba(82, 203, 239, 0.8)"})
				}

				if(target.innerHTML == dimensions.sizeDim){
					$($(this.picker_body.children()[i]).children()[3]).css({"background":"rgba(82, 203, 239, 0.8)"})
				}

				if(target.innerHTML == dimensions.colorDim){
					$($(this.picker_body.children()[i]).children()[4]).css({"background":"rgba(82, 203, 239, 0.8)"})
				}
				
			};

	}

	var get_scale = this.get_scale = function( header ){
	    var min = datapoints[0].fields[header];
	    var max = datapoints[0].fields[header];

	    for(var i = 0; i < datapoints.length; i++){
	        if(datapoints[i].fields[header] > max){
	            max = datapoints[i].fields[header];
	        }
	        if(datapoints[i].fields[header] < min){
	            min = datapoints[i].fields[header];
	        }
	    }
	    return {min: min, max: max};
	}

	var set_scale = this.set_scale = function( dimensions ){
	    if(dimensions != null){ 

	        var x_var = dimensions.xDim;
	        var y_var = dimensions.yDim;
	        var color_var = dimensions.colorDim;
	        var size_var = dimensions.sizeDim;

	    }else{ //legacy functionality if no arg is supplied

	        var x_var = xDim;
	        var y_var = yDim;
	        var color_var = colorDim;
	        var size_var = sizeDim;

	    }
	    xScale = 0;
	    yScale = 0;
	    colorScale = 0;
	    sizeScale = 0;


	    for (var i = 0; i < datapoints.length; i++) {
	        var xPos = datapoints[i].fields[x_var];
	        var yPos = datapoints[i].fields[y_var];
	        var colorPos = datapoints[i].fields[color_var];
	        var sizePos = datapoints[i].fields[size_var];


	        if(xPos > xScale){
	            xScale = xPos;
	        }
	        if(yPos > yScale){
	            yScale = yPos;
	        }
	        if(colorPos > colorScale){
	            colorScale = colorPos;
	        }
	        if(sizePos > sizeScale){
	            sizeScale = sizePos;
	        }
	    }
	    //console.log("xScale: "+xScale);
	    //console.log("yScale: "+yScale);
	}

	var position_points = this.position_points = function( dimensions ) {

	    if(dimensions != null){ 

	        var x_var = dimensions.xDim;
	        var y_var = dimensions.yDim;
	        var color_var = dimensions.colorDim;
	        var size_var = dimensions.sizeDim;

	    }else{ //legacy functionality if no arg is supplied

	        var x_var = xDim;
	        var y_var = yDim;
	        var color_var = colorDim;
	        var size_var = sizeDim;

	    }



	    balls.beginTransition();
	    this.set_scale( dimensions );

	    for (var i = 0; i < datapoints.length; i++) {
	        var xPos = datapoints[i].fields[x_var];
	        var yPos = datapoints[i].fields[y_var];
	        datapoints[i].moveTarget(xPos * 580/xScale + 20, yPos * 380/ yScale + 20);

	        datapoints[i].enabled = true;

	        //check filters
	        for(var j = 0; j < filter_list.length; j++){
	            if(typeof(filter_list[j]) != "undefined"){
	                if(filter_list[j].filter_point(datapoints[i]) == false){
	                    datapoints[i].enabled = false;
	                }
	            }
	        }

	        //notes on color from Jeff
	        //color themes
	        //colorscheme object
	            //nomitave
	            //points (0,.5,1)
	        //colorforvalue function (0-1)
	        //nomitave schemes (blocky)
	        //converts luva color space
	        //linear interpolation
	        //converts it back to RGB


	        //set color
	        if(typeof(color_var) != "undefined"){
	            //point.body.style()
	            var colorPos = datapoints[i].fields[color_var];
	            if(datapoints[i].enabled == true && filter_list.length > 0){
	                var colorString = "rgb(255,0,0)";
	            }
	            else if(datapoints[i].enabled == true && filter_list.length == 0){
	                var colorString = "rgb("+Math.round(colorPos/colorScale * 255)+","+Math.round(colorPos/colorScale * 255)+","+Math.round(colorPos/colorScale * 255)+")";
	            }
	            else{
	                //var colorString = "rgba("+Math.round(colorPos/colorScale * 255)+","+Math.round(colorPos/colorScale * 255)+","+Math.round(colorPos/colorScale * 255)+","+.2+")";
	                var colorString = "rgb("+Math.round(colorPos/colorScale * 255)+","+Math.round(colorPos/colorScale * 255)+","+Math.round(colorPos/colorScale * 255)+")";
	            }
	            //console.log(colorString);


	            datapoints[i].style = colorString;

	            newstyle = function(){
	                return this.colorstring;
	            }
	            //datapoints[i].redraw(newstyle);
	        }

	        //set size
	        if(typeof(size_var) != "undefined"){
	            var max_radius = 10;
	            var min_radius = 3;


	            var sizePos = datapoints[i].fields[size_var];
	            datapoints[i].radius = Math.round(sizePos / sizeScale * 7) + 3;

	        }


	    }

	}

}

var puiController = new pickerUIController();