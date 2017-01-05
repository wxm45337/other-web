"use strict";
let db = require('../dbHelper'),
	commonFun = require('../common/common') ;

let saveDomains = (domains)=>{
	domains.forEach(function(dom){
		// var id = dom.insertId;
		/*db.addObject('tb_bm_domain',{name: dom.name},function(error,dt){
			console.log(dt);
		});*/
	});
}
let queryDomains = (obj)=>{
	return new Promise((resolve,reject)=>{
		db.getList( 
			'tb_bm_domain',
			commonFun.isEmptyObject(obj)?null:obj
		).then(function(dt){
			resolve(dt);
		},function(error){
			reject(error);
		});
	});
}
module.exports = {
	saveDomains: saveDomains,
	queryDomains: queryDomains
}