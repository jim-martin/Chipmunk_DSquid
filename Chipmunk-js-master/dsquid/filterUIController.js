/**
 * Created by zackaman on 7/20/15.
 */

var filterUIController = function(){
    var globalList = this.globalList = [];
    var lensesList = this.lensesList = [];
    var wallsList = this.wallsList = [];

    var filters_open = this.filters_open = false;

    var open_filters = this.open_filters = function(){
        console.log("open filters");
        if(!filters_open){
            filters.css({"right": "0"});
            filters_open = true;

            repopulate_filter_panel();
        }
        else{
            filters.css({"right":"-60%"})
            filters_open = false;
        }
    }

    var repopulate_filter_panel = function(){
        //clear boxes
        $("#globalList").html("");
        $("#lenseList").html("");
        $("#wallList").html("");

        //repopulate
        for(var k = 0; k < lensesList.length; k++) {
            for (var p = 0; p < lensesList[k].filterList.length; p++) {
                var curFilter = lensesList[k].filterList[p];

                //curFilter.id is just incremented as filters are created
                var newFilter = $('<div filter_id="' + curFilter.id + '"><select onchange="fuiController.filter_update_axes(this, '+curFilter.id+')">Axes</select> Min: <input type="number"  onchange="fuiController.filter_update_numbers(this, '+curFilter.id+')"> Max: <input type="number" onchange="fuiController.filter_update_numbers(this, '+curFilter.id+')"><span onclick="fuiController.remove_filter(this, '+curFilter.id+')"> Remove</span></div>');
                $("#lenseList").append(newFilter);

                var newSelect = newFilter.children("select")[0];

                //populate select
                for (var i = 1; i < headers.length; i++) {
                    newSelect.options[i - 1] = new Option(headers[i], headers[i]);
                }

                //set selected
                $(newSelect).val(curFilter.header);

                //populate values in min / max
                min_field = newFilter.children("[type='number']")[0];
                max_field = newFilter.children("[type='number']")[1];

                $(min_field).val(curFilter.min);
                $(max_field).val(curFilter.max);
            }
        }
    }

    //given dom element and filter id
    //update the filter object and the corresponding dom fields
    var filter_update_axes = this.filter_update_axes = function(a, id){
        //get parent for filter index
        var filter_parent= $(a).parent();
        var filter_id = id;


        var curFilter = select_filter(filter_id);

        console.log(curFilter);

        //set which header field the filter is using
        curFilter.header = $(a).val();

        //update the min / max values
        var min_max = get_scale($(a).val());

        curFilter.min = min_max.min;
        curFilter.max = min_max.max;

        //update dom to reflect new min/max
        min_field = filter_parent.children("[type='number']")[0];
        max_field = filter_parent.children("[type='number']")[1];

        $(min_field).val(min_max.min);
        $(max_field).val(min_max.max);

        //redraw
        call_all_lenses();
    }

    //takes updates from numbers (DOM) for a single filter and updates it in the object
    var filter_update_numbers = this.filter_update_numbers = function(a, id){
        var filter_parent = $(a).parent();
        var filter_id = id;

        var curFilter = select_filter(filter_id);


        min_field = filter_parent.children("[type='number']")[0];
        max_field = filter_parent.children("[type='number']")[1];

        curFilter.min = $(min_field).val();
        curFilter.max = $(max_field).val();

        //redraw
        call_all_lenses();
    }

    //removes filter from dom and object
    var remove_filter = this.remove_filter = function(a, id){
        console.log("remove filter");
        var filter_id = id;

        for(var i = 0; i < globalList.length; i++){
            for( var j = 0; j < globalList[i].filterList.length; j++){
                //console.log(globalList[i].filterList[j].id);
                if(filter_id == globalList[i].filterList[j].id){
                    globalList[i].filterList.splice(j,1);
                }
            }
        }
        for(var i = 0; i < lensesList.length; i++){
            for( var j = 0; j < lensesList[i].filterList.length; j++){
                //console.log(lensesList[i].filterList[j].id);
                if(filter_id == lensesList[i].filterList[j].id){
                    lensesList[i].filterList.splice(j,1);
                }
            }
        }
        for(var i = 0; i < wallsList.length; i++){
            for( var j = 0; j < wallsList[i].filterList.length; j++){
                //console.log(wallsList[i].filterList[j].id);
                if(filter_id == wallsList[i].filterList[j].id){
                    wallsList[i].filterList.splice(j,1);
                }
            }
        }


        $(a).parent().remove();

        //redraw
        call_all_lenses();
    }

    //returns the filter with the corresponding id
    var select_filter = this.select_filter = function(id){
        var filter_id = id;

        var curFilter;
        for(var i = 0; i < globalList.length; i++){
            for( var j = 0; j < globalList[i].filterList.length; j++){
                //console.log(globalList[i].filterList[j].id);
                if(filter_id == globalList[i].filterList[j].id){
                    curFilter = globalList[i].filterList[j];
                }
            }
        }
        for(var i = 0; i < lensesList.length; i++){
            for( var j = 0; j < lensesList[i].filterList.length; j++){
                //console.log(lensesList[i].filterList[j].id);
                if(filter_id == lensesList[i].filterList[j].id){
                    curFilter = lensesList[i].filterList[j];
                }
            }
        }
        for(var i = 0; i < wallsList.length; i++){
            for( var j = 0; j < wallsList[i].filterList.length; j++){
                //console.log(wallsList[i].filterList[j].id);
                if(filter_id == wallsList[i].filterList[j].id){
                    curFilter = wallsList[i].filterList[j];
                }
            }
        }
        return curFilter;
    }

    var call_all_lenses = this.call_all_lenses = function(){
        clean_all_datapoints();
        for(var i = 0; i < lensesList.length; i++){
            lensesList[i].callFilters();
        }
    }
}


function add_filter() {
    //create new select

    var newFilter = $('<div filter_id="'+filter_list.length+'"><select onchange="filter_update_axes(this)">Axes</select> Min: <input type="number"  onchange="filter_update_numbers(this)"> Max: <input type="number" onchange="filter_update_numbers(this)"><span onclick="remove_filter(this)"> Remove</span></div>')
    $("#loose_filters").append(newFilter);

    newSelect = newFilter.children("select")[0];

    //populate select
    for (var i = 1; i < headers.length; i++) {
        newSelect.options[i - 1] = new Option(headers[i], headers[i]);
        //ySelect.options[i - 1] = new Option(headers[i], headers[i]);

        //onchange -> redraw

        //<select id="xAxis" onchange="position_points();"></select>



    }
    var scale = get_scale(headers[1]);
    //populate values in min / max
    min_field = newFilter.children("[type='number']")[0];
    max_field = newFilter.children("[type='number']")[1];

    $(min_field).val(scale.min);
    $(max_field).val(scale.max);

    //create new filter
    //console.log(new_filter("Sector #", 5, 8));

    //push new filter to filters[]
    filter_list.push(new_filter("Sector #", scale.min, scale.max));

    //allow change through interface to edit the filter in filter[]

    //filter
}


var fuiController = new filterUIController();
