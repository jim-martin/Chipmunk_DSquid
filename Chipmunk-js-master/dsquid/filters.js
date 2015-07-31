/**
 * Created by zackaman on 7/20/15.
 */
var filter_list = [];
var filters = $("#filters");
var filterCount = 0;

var Filter = function(){
    newFilter = {};

    var scale = get_scale(headers[1]);

    newFilter.min = scale.min;
    newFilter.max = scale.max;
    newFilter.header = "Sector #";

    newFilter.id = filterCount;
    filterCount++;

    newFilter.filter_point = function(datapoint){
        //console.log(datapoint.fields[this.header]);
        if(typeof(datapoint) != "undefined" && datapoint.fields[this.header] <= this.max && datapoint.fields[this.header] >= this.min){
            return true;
        }
        else{
            return false;
        }
    }

    //return object with array of enabled and array of disabled
    //if no argument is given, default to entire set of datapoints
    newFilter.filter_points = function(dp){
        if(typeof(dp) == "undefined"){
            dp = datapoints;
        }

        var points = {};
        points.enabled = [];
        points.disabled = [];
        for(var i = 0; i < dp.length; i++){
            var filtered = this.filter_point(dp[i]);
            if(filtered){
                points.enabled.push(dp[i]);
            }
            else{
                points.disabled.push(dp[i]);
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