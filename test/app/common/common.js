'use strict';
let isEmptyObject = function(e) {  
    var bo = true;
    for (var t in e){
        bo = false;  
    }  
    return bo;
}  
module.exports = {
	isEmptyObject: isEmptyObject
}
