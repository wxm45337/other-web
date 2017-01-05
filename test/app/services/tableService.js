"use strict";
let db = require('../dbHelper'),
	commonFun = require('../common/common') ;

/**
 * 获取表信息
 * param ：table_id
 */
let getTable = (table_id)=>{
	return new Promise((resolve,reject)=>{
			db.getList('tb_bm_table', table_id?{table_id: table_id}:null).then(function(dt){
				console.log('----------',dt);
				resolve(dt);
			},function(error){

			});
});

};

/**
 * 获取表信息
 * param ：tableId
 */
let getTableColumn = (table_id)=>{
	return new Promise((resolve,reject)=>{
			db.getList('tb_bm_column', table_id?{table_id: table_id}:null).then(function(dt){
				console.log('----------',dt);
				resolve(dt);
			},function(error){

			});
	});

};

/**
 * 获取表信息
 * param ：tableId
 */
let getTableForeign = (table_id)=>{
	return new Promise((resolve,reject)=>{
			db.getList('tb_bm_foreign', table_id?{key_table_id: table_id}:null).then(function(dt){
				console.log('----------',dt);
				resolve(dt);
			},function(error){

			});
	});

};

/**
 * 获取表信息
 * param ：tableId
 */
let getTableHistory = (table_id)=>{
	return new Promise((resolve,reject)=>{
			db.getList('tb_bm_table_his', table_id?{table_id: table_id}:null).then(function(dt){
				console.log('----------',dt);
				resolve(dt);
			},function(error){

			});
	});

};

/**
 * 获取表信息
 * param ：tableId
 */
let newTable = (table)=>{
	return new Promise((resolve,reject)=>{
		console.log('------------------',table);
			db.add('tb_bm_table', table).then(function(dt){
				console.log('----------',dt);
				resolve(dt);
			},function(error){

			});
	});

};

/**
 * 获取表信息
 * param ：tableId
 */
let newTableColumn = (columns)=>{
	console.log('.........',columns);
	return new Promise((resolve,reject)=>{
			for(var i=0; i<columns.length; i++){
			var column = columns[i];
			db.add('tb_bm_column', column).then(function(dt){
				console.log('----------',dt);
				resolve(dt);
			},function(error){

			});
		}
	});

};

/**
 * 获取表信息
 * param ：tableId
 */
let newTableForeign = (foreigns)=>{
	return new Promise((resolve,reject)=>{
			for(var i=0; i<foreigns.length; i++){
			var foreign = foreigns[i];
			db.add('tb_bm_foreign', foreign).then(function(dt){
				console.log('----------',dt);
				resolve(dt);
			},function(error){

			});
		}
	});
};

/**
 * 获取表信息
 * param ：tableId
 */
let newTableHistory = (historys)=>{
	return new Promise((resolve,reject)=>{
		for(var i=0; i<historys.length; i++){
			var history = historys[i];
			db.add('tb_bm_table_his', history).then(function(dt){
				console.log('----------',dt);
				resolve(dt);
			},function(error){

			});
		}
	});
};

/**
 * 获取表信息
 * param ：tableId
 */
let updateTable = (table)=>{
	return new Promise((resolve,reject)=>{
			db.update('tb_bm_table', table?table:null, table?{table_id:table.table_id}:null).then(function(dt){
				console.log('----------',dt);
				resolve(dt);
			},function(error){

			});
	});
};

let getTableByDomain = (obj)=>{
	return new Promise((resolve,reject)=>{
		// console.log(obj);
		db.getList('tb_bm_table', 
			commonFun.isEmptyObject(obj)?null:obj
		).then(function(dt){
			// console.log('----------',dt);
			resolve(dt);
		},function(error){

		});
	});
};

module.exports = {
	getTableByDomain: getTableByDomain,
	getTable: getTable,
	getTableColumn: getTableColumn,
	getTableForeign: getTableForeign,
	getTableHistory: getTableHistory,
	newTable: newTable,
	newTableColumn: newTableColumn,
	newTableForeign: newTableForeign,
	newTableHistory: newTableHistory,
	updateTable: updateTable
}
