/**
 * Created by zackaman on 7/20/15.
 */
var filter_list = [];
var filters = $("#filters");

var Filter = function(){
    newFilter = {};

    var scale = get_scale(headers[1]);

    newFilter.min = scale.min;
    newFilter.max = scale.max;
    newFilter.header = "Sector #";

    newFilter.filter_point = function(datapoint){
        //console.log(datapoint.fields[this.header]);
        if(datapoint.fields[this.header] <= this.max && datapoint.fields[this.header] >= this.min){
            return true;
        }
        else{
            return false;
        }
    }

    //return object with array of enabled and array of disabled
    newFilter.filter_points = function(datapoints){
        var points = {};
        points.enabled = [];
        points.disabled = [];
        for(var i = 0; i < datapoints.length; i++){
            var filtered = this.filter_point(datapoints[i]);
            if(filtered){
                points.enabled.push(datapoints[i]);
            }
            else{
                points.disabled.push(datapoints[i]);
            }
        }
        return points;
    }

    newFilter.changeHeader = function(newHeader){
        this.header = newHeader;
        var scale = get_scale(newHeader);
        this.max = scale.max;
        this.min = scale.min;
    }

    return newFilter;
}

var filters_open = false;
function open_filters() {
    console.log("open filters");
    if(!filters_open){
        filters.css({"right": "0"});
        filters_open = true;
    }
    else{
        filters.css({"right":"-60%"})
        filters_open = false;
    }
}

function add_filter() {
    //create new select

    var newFilter = $('<div filter_id="'+filter_list.length+'"><select onchange="filter_update_axes(this)">Axes</select> Min: <input type="number"  onchange="filter_update_numbers(this)"> Max: <input type="number" onchange="filter_update_numbers(this)"><span onclick="remove_filter(this)"> Remove</span></div>')
    $("#filters").append(newFilter);

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

var new_filter = function(header, min, max){
    var filter = {};
    filter.header = header;
    filter.min = min;
    filter.max = max;

    //return boolean
    //if datapoint[header] within bounds of min / max, return true
    //else, return false
    filter.filter_point = function(datapoint){
        //console.log(datapoint.fields[this.header]);
        if(datapoint.fields[this.header] <= this.max && datapoint.fields[this.header] >= this.min){
            return true;
        }
        else{
            return false;
        }
    }

    return filter;
}

//var test_filter = new_filter("Sector #", 5, 8);


function remove_filter(a){
    console.log("remove filter");
    var filter_id = $(a).parent().attr("filter_id");

    delete filter_list[filter_id];


    $(a).parent().remove();

    //redraw
}

function filter_update_axes(a){


    //get parent for filter index
    var filter_parent = $(a).parent();
    var filter_id = filter_parent.attr("filter_id");


    //set which header field the filter is using
    filter_list[filter_id].header = $(a).val();

    //update the min / max values
    var min_max = get_scale($(a).val());

    filter_list[filter_id].min = min_max.min;
    filter_list[filter_id].max = min_max.max;

    min_field = filter_parent.children("[type='number']")[0];
    max_field = filter_parent.children("[type='number']")[1];

    $(min_field).val(min_max.min);
    $(max_field).val(min_max.max);

    //console.log(filter_list);

    //redraw
    position_points();

}
function filter_update_numbers(a){
    var filter_parent = $(a).parent();
    var filter_id = filter_parent.attr("filter_id");

    min_field = filter_parent.children("[type='number']")[0];
    max_field = filter_parent.children("[type='number']")[1];

    filter_list[filter_id].min = $(min_field).val();
    filter_list[filter_id].max = $(max_field).val();

    //console.log(filter_list);

    //redraw
    position_points();
}