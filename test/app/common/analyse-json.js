"use strict";
let fs = require('fs'),
	path = require('path'),
	db = require('../dbHelper'),
	node_ssh = require('node-ssh'),
	config = require('../config');

let jsonTableService = require('../services/json-table');

let allSQL = [];
/**
 * 解析表
 * param ：
 * jsonObj： json对象
 */
let analyseTable = (jsonObj)=>{
	return new Promise(function(resovle,reject){
		let ps = [];
		if(jsonObj && jsonObj.domains && jsonObj.domains.length>0){
			let domains = jsonObj.domains;
			domains.forEach(function(domian){
				ps.push(domainProc(domian,0));
			});
		}
		Promise.all(ps).then(function(){
			//导入外键关系
			new Promise(function(resolve,reject){
				let fps = [];
				foreignObj.forEach(function(f){
					fps.push(new Promise(function(resolve,reject){
						db.addObject('tb_bm_foreign',{
							key_table_id:tableObj[f.key_table].table_id,
							key_column_id:tableObj[f.key_table][f.key],
							ref_table_id:tableObj[f.ref_table].table_id,
							ref_column_id:tableObj[f.ref_table][f.ref_key],
							type: 1 //1=外键关系 2=数据关系
						},function(err,ret){
							resolve();
						});
					}));
				});
				Promise.all(fps).then(function(){
					resovle();
				})
			}).then(function(){
				resovle();
			});
		});
	});
}
/**
 * 读取文件
 * param ：
 * url 文件名
 */
let sqlFile = 'create_table.sql';
let readFile = (url)=>{
	let _dirname = path.join(__dirname, url);
	// let _dirname = path.join(__dirname, url||'table.json' );
	console.log(_dirname);
	fs.readFile(_dirname,function(error,data){
		// console.log(data);
		let jsonObj=JSON.parse(data);
		analyseTable(jsonObj).then(function(){
			//将hive执行脚本保存到create_table.sql中
			let _sqlFile = path.join(__dirname,sqlFile);
			console.log(_sqlFile);
			fs.writeFile(_sqlFile,allSQL.join(''),function(err){
				//执行hive创建脚本 alter table ttestlgx3 add columns (test3 string,test4 string)
				let ssh = new node_ssh()
				ssh.connect({
				  host: config.hive_config.host,
				  username: config.hive_config.username,
				  password: config.hive_config.password
				}).then(function() {
					console.log('----------connection ssh----------');
					//cd m2m/ctg-m2m-orderportal-web/src/main/webapp/console \n ls
					//上传create_table.sql脚本文件到服务器
					return ssh.putFile(_sqlFile,sqlFile).then(function(data){
						console.log('putFile',data);
					});
				}).then(function(){
					return ssh.execCommand('hive -f '+sqlFile).then(function(data){
						console.log('exec',data);
						ssh.dispose();
						console.log('hive表生成成功！');
						// return ssh.exec('ls');
					});
				});
			});
			console.log('导入成功！');
		});
	});
};


/**
 * domain域解析
 */

let tableObj = {};//新建表的结构数据
let foreignObj = []; //待处理的外键
let domainProc = (domain,parent_domain_id) => {
	return new Promise(function(resolve, reject){
		if(domain){
			//插入数据到tb_bm_domain表
			db.addObject('tb_bm_domain',{parent_domain_id:parent_domain_id,name:domain.name},function(err,ret){
				if(!err && ret){
					let ps = [];
					let domain_id = ret.insertId;
					let tables = domain.tables;
					if(tables && tables.length>=1){
						tables.forEach(function(table){
							ps.push(tableProc(table,domain_id));
						});
					}

					let subDomains = domain.subDomains;
					if(subDomains && subDomains.length >= 1){
						subDomains.forEach(function(subDomain){
							ps.push(domainProc(subDomain, domain_id));
						});
					}
					Promise.all(ps).then(function(){
						resolve();
					}).catch(function(){
						reject();
					});
				} else {
					reject(err);
				}
			});
		}else{
			reject();
		}
	});
}


//表解析
let tableProc = (table,domain_id) => {
	return new Promise(function(resolve, reject){
		//插入数据到tb_bm_table表
		db.deleteObject('tb_bm_table',{name:table.name},function(err,ret){
			console.log(err,ret);
			db.addObject('tb_bm_table',{
				domain_id:domain_id,
				name:table.name,
				chinese_name:table.chineseName,
				type: 1,//1=基础表;2=结果表;3=衍生表
				state: 'S0A',//S0A=正常;S0D=待审核
				version: 1,
				comment: table.comment,
				data_type: config.HIVE //hive、mysql、hbase
			},function(err,ret){
				let ps = [];
				if(ret){
					//生成hive的sql
					let sql = 'drop table '+table.name+'; create table '+table.name +'(';

					let table_id = ret.insertId;
					tableObj[table.name]={table_id:table_id};
					let columns = table.columns;
					let colObj={};
					if(columns && columns.length>=1){
						tableObj[table.name].columnObj ={};
						//插入数据到tb_bm_column表
						console.log(columns);
						columns.forEach(function(column){
							sql += column.name+' '+ column.type+',';
							ps.push(new Promise(function(resolve,reject){
								db.addObject('tb_bm_column',{
									table_id:table_id,
									name: column.name,
									chinese_name:column.chineseName,
									data_type: column.type,
									comment: column.comment,
									isPrimary: column.isPrimary
								},function(err,ret){
									if(ret){
										tableObj[table.name][column.name]=ret.insertId;
									}
									resolve();
								});
							}));
						});
						sql = sql.substr(0,sql.length-1)+');'
						allSQL.push(sql);
					}

					let foreignKeys = table.foreignKeys;
					if(foreignKeys && foreignKeys.length>=1){
						//保存外键到临时数据，待所有表创建完再导入外键关系
						foreignKeys.forEach(function(foreignKey){
							foreignObj.push({
								key_table:table.name,
								key:foreignKey.key,
								ref_table:foreignKey.ref_table_name,
								ref_key:foreignKey.ref_key
							});
							//插入数据到tb_bm_foreign表
							// let timeForeign = () =>{
							// 	if(tableObj[table.name].table_id && tableObj[table.name][foreignKey.key] 
							// 		&& tableObj[foreignKey.ref_table_name].table_id && tableObj[foreignKey.ref_table_name][foreignKey.ref_key]){
							// 		db.addObject('tb_bm_foreign',{
							// 			key_table_id:tableObj[table.name].table_id,
							// 			key_column_id:tableObj[table.name][foreignKey.key],
							// 			ref_table_id:tableObj[foreignKey.ref_table_name].table_id,
							// 			ref_column_id:tableObj[foreignKey.ref_table_name][foreignKey.ref_key],
							// 			type: 1 //1=外键关系 2=数据关系
							// 		},function(err,ret){
							// 		});							
							// 	} else
							// 		setTimeout(timeForeign,1000);
							// 	}
							// timeForeign();
						});
					}
				}
				Promise.all(ps).then(function(){
					resolve();
				}).catch(function(){
					reject();
				})
			});
		});
	});
}
//取hive表数据
let getHiveTableData = (sql)=>{
	let ssh = new node_ssh();
	ssh.connect({
		host:config.hive_config.host,
	  	username: config.hive_config.username,
	  	password: config.hive_config.password
	}).then(()=>{
		let com = "hive -e '"+(sql||"select * from product")+";';";
		return ssh.execCommand(com).then((data)=>{
			ssh.dispose();
			var rows = [];
			if(data && data.stdout){
				var stdout = data.stdout;
				rows = regCommandData(stdout);
			}
			console.log(rows);
		});
	});
}
//正则解析数据
let regHiveCommandData = function(data){
	var rows = [],
		rowReg = /.*(?=\n)/g,
		colomnReg = /.*(?=\n)/g;
	let rowsData = data.match(rowReg);
	rowsData.forEach(function(item){
		if(item){
			let colomnsData = (item+'\t').match(colomnReg);
			if(colomnsData&&colomnsData.length>0){
				rows.push(colomnsData[0].split('\t'));
			}
		}
	});
	return rows;
}
// var stdout= '1\tNULL\tNULL\n2\tNULL\tNULL\n3\tNULL\tNULL\n4\tNULL\tNULL\n5\tNULL\tNULL\n6\tNULL\tNULL\n7\t234234234\tretgwertwertwer\nsdffsdf7\t234234234dfgdfg\tretgwertwertwsdfgdfgdfer\n';

module.exports = {
	readFile: readFile,
	getHiveTableData: getHiveTableData
}
// getTableData();
// var num = 1;
// readFile('table.json');
// readFile(('1'+num+'.json'));