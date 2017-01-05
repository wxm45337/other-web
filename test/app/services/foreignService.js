"use strict";
let db = require('../dbHelper');

/**
 * 获取外表信息
 * param ：tableId
 */
let getForeignByDomain = (obj)=>{
	return new Promise((resolve,reject)=>{
		console.log(obj.domain_id);
		var sql = 'select distinct key_table_id,ref_table_id ,tk.name key_table_name,tr.name ref_table_name'+
				' from tb_bm_foreign f,tb_bm_table tk,tb_bm_table tr '+
				' where f.key_table_id=tk.table_id and f.ref_table_id=tr.table_id '+
  				' and tk.state="S0A" and tr.state="S0A"'+
 				' and tk.domain_id='+obj.domain_id;
 		// console.log(sql);
		db.execSql(sql,function(error,dt){
			if(error){
				reject('error');
			}else{
				resolve(dt);
			}
		})
	});
};

module.exports = {
	getForeignByDomain: getForeignByDomain
}
