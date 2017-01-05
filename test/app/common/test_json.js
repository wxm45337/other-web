"use strict";
let fs = require('fs'),
	path = require('path');

let _dirname = path.join(__dirname, 'table1.json' );

fs.readFile(_dirname,function(error,data){
	let jsonObj=JSON.parse(data);
	let tb = {};
	for(let i in jsonObj.domains[0].tables){
		let t = jsonObj.domains[0].tables[i];
		if(tb[t.name]){//去重复表
			// console.log('重复表名：',t.name);
		}else{
			tb[t.name] = t.name;
			console.log('insert into tb_bm_table(domain_id,name,chinese_name,type,state,version,comment,data_type) values('+
					'0,"'+t.name+'","'+t.name+'",1,"S0A",1,"","'+'HIVE'+'");');
			for(let j in t.columns){
				let c = t.columns[j];
				console.log('insert into tb_bm_column(table_id,name,data_type,comment,isPrimary,chinese_name) select table_id,"'+c.name+'",'+
						'"'+c.type+'","'+c.comment+'",'+(c.isPrimary=='true'?'true':'false')+',"'+c.name+'" '+
						'from tb_bm_table where name="'+t.name+'";');
			}
		}
	}
});