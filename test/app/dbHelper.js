"use strict";
var config = require('./dbconfig');

var options = {
    'host': config.db_host,
    'port': config.db_port,
    'database': config.db_name,
    'user': config.db_user,
    'password': config.db_passwd,
    'charset': config.db_charset,
    'connectionLimit': config.db_conn_limit,
    'supportBigNumbers': true,
    'bigNumberStrings': true
}

var mysql = require('mysql2');
var pool = mysql.createPool(options);

//执行所有sql语句
function execQuery(sql, values, callback) {
    var errinfo;
    pool.getConnection(function(err, connection) {
        if (err) {
            errinfo = 'DB-connect error！';
            console.log(errinfo);
            throw errinfo;
            // release(connection);
        } else {
            var querys = connection.query(sql, values, function(err, rows) {
                release(connection);
                console.log('SQL：'+querys.sql);
                if (err) {
                    errinfo = 'DB-SQL error:' + err;
                    console.log(errinfo);
                    //throw errinfo;
                    callback(err);
                } else {
                    callback(null,rows);
                }
            });
        }
    });
}

function release(connection) {
    try {
        connection.release(function(error) {
            if (error) {
                console.log('DB-关闭数据库连接异常！');
            }
        });
    } catch (err) {}
}

function execUpdate(sql, values, callback){
    execQuery(sql, values, callback);
    /*execQuery(sql, values, function(result) {
        console.log(result);
        if (callback) {
            var affectedRows = 0;
            if (result) {
                affectedRows = result.affectedRows
            }
            callback({
                affectedRows: affectedRows
            });
        }
    });*/
}

//执行sql语句，返回影响条数
exports.update = function(sql, values, callback) {
    execUpdate(sql, values, callback);
}
exports.query = function(tablename, values,callback) {
    return new Promise(function(resolve, reject){
        var sql = 'select * from ??',
            params = [tablename];
        if(values){
            sql += ' where ?',
                params.push(values);
        }
        execQuery(sql, params, function(err, rows){
            if(err){
                reject(err);
            }else{
                callback(rows);
                resolve(rows);
            }
        })
    });
}
//查询分页
exports.queryPage = function(sql, values, page, size, callback) {
    if (page > 0) {
        page--;
    } else {
        page = 0;
    }
    execQuery(sql + ' LIMIT ' + page * size + ',' + size, values, function(rresult) {
        var index = sql.toLocaleUpperCase().lastIndexOf(' FROM');
        sql = 'SELECT COUNT(*) count ' + sql.substring(index);
        execQuery(sql, values, function(cresult) {
            if (callback) {
                var pagenum = cresult[0].count / size;
                if (cresult[0].count % size > 0) {
                    pagenum++;
                }
                callback({
                    count: pagenum,
                    rows: rresult
                });
            }
        });
    });
}

//查询集合
exports.getList = function(tablename,values){
    return new Promise(function(resolve,reject){
        var sql = 'SELECT * FROM ??',
            params = [tablename];
        if(values){
            sql += ' where ?',
                params.push(values);
        }
        execQuery(sql, [tablename, values], function(err,result) {
            if (err) {
                reject(err);
            }else{
                resolve(result);
            }
        });
    });
}

//根据主键 查询对象  ------------未完成
exports.getById = function(tablename, id){
    return new Promise(function(resolve, reject){
        var values = {code:id};
        var sql = 'select * from ?? where ?';
        execQuery(sql,[tablename, values], function(err, rows){
            if(err){
                reject(err);
            }else{
                resolve(rows);
            }
        })
    });
}
//查询对象
exports.getObject = function(tablename, values, callback) {
    return new Promise(function(resolve,reject){
        var sql = 'SELECT * FROM ?? WHERE ?';
        execQuery(sql, [tablename, values], function(err,result) {
            if (err) {
                reject(err);
            }else{
                if (result && result.length > 0) {
                    resolve(result[0]);
                } else {
                    resolve(null);
                }
            }
        });
    });
}

//添加一条记录
exports.addObject = function(tablename, values, callback) {
    var sql = 'INSERT INTO ?? SET ?';
    execUpdate(sql, [tablename, values], callback);
}

//更新记录
exports.updateObject = function(tablename, values, id, callback) {
    var sql = 'UPDATE ?? SET ? WHERE ?';
    execUpdate(sql, [tablename,
        values, id
    ], callback);
}

//删除记录
exports.deleteObject = function(tablename, values, callback) {
    var sql = 'DELETE FROM ?? WHERE ?';
    execUpdate(sql, [tablename, values], callback);
}

//新增记录
exports.add = function(tablename,values){
    return new Promise(function(resolve,reject){
        var sql = 'INSERT INTO ??',
        params = [tablename];
        if(values){
            sql += ' SET ?',
                params.push(values);
        }
        execUpdate(sql, [tablename, values], function(err,result) {
            if (err) {
                reject(err);
            }else{
                resolve(result);
            }
        });
    });
}

//update记录
exports.update = function(tablename, values, id){
    return new Promise(function(resolve,reject){
        var sql = 'UPDATE ??',
        params = [tablename];
        if(values){
            sql += ' SET ?',
                params.push(values);
        }
        if(id){
            sql += ' WHERE ?',
                params.push(id);
            console.log('sql--params',params);
            execUpdate(sql, [tablename, values, id], function(err,result) {
                if (err) {
                    reject(err);
                }else{
                    resolve(result);
                }
            });
        }
    });
}

/**
 * 根据表标识获取创建表的SQL
 * table_id  表标识
 */

exports.getCreateTableSql = function(table_id){
    return new Promise(function(resolve,reject){
        let createSql = 'create table ';
        db.getObject('tb_bm_table',{table_id:table_id}).then(function(data){
            createSql +=  data.name+'(';
            db.getList('tb_bm_column',{table_id:table_id}).then(function(data){
                let pk=[];
                let cs = [];
                data.forEach(function(c){
                    cs.push(c.name +' '+c.data_type);
                    if(c.isPrimary){
                        pk.push(c.name);
                    }
                });
                return {pk:pk,cs:cs};
            }).then(function(colObj){
                console.log(colObj);
                createSql += colObj.cs.join(',');
                if (data.data_type==config.MYSQL && colObj.pk.length>=1){
                    createSql += ',primary key ('+colObj.pk.join(',')+')';
                }
                createSql += ');';
            }).then(function(){
                if (data.data_type==config.MYSQL){
                    db.execSql('select f.foreign_id,t.name as tname,ck.name as ckname,cr.name as crname from tb_bm_foreign f,tb_bm_table t,tb_bm_column ck,tb_bm_column cr '+
                        'where f.ref_table_id=t.table_id and f.ref_column_id=cr.column_id and f.key_column_id = ck.column_id and f.key_table_id='+
                        table_id,null,function(err,ret){
                        ret.forEach(function(f){
                            createSql += 'alter table '+data.name+' add constraint FK_Reference_'+f.foreign_id+' foreign key ('+f.ckname+') '+
                          'references '+f.tname+' ('+f.crname+') on delete cascade on update cascade;';
                        });
                        resolve(createSql);
                    });
                }else{
                    resolve(createSql);
                }
            });
        });
    });
}

/**
 * 根据表标识和字段表示数组获取表的修改脚本
 * table_id 表标识
 * column_ids  字段表示数组
 */

exports.getAlterTableSql = function(table_id,column_ids){
    return new Promise(function(resolve,reject){
        db.getObject('tb_bm_table',{table_id:table_id}).then(function(data){
            let alterSql = [];
            db.execSql('select * from tb_bm_column where column_id in ('+column_ids.join(',')+')',null,
                function(err,ret){
                ret.forEach(function(c){
                    switch(data.data_type){
                        case config.MYSQL:
                            alterSql.push('alter table '+data.name+ ' add column '+c.name+' '+c.data_type+';');
                            break;
                        default:
                            alterSql.push(c.name+' '+c.data_type);
                            //  ttestlgx3 add columns (test3 string,test4 string)
                    }
                });
                let returnSql = '';
                switch(data.data_type){
                    case config.MYSQL:
                        returnSql = alterSql.join(',');
                        break;
                    default:
                        returnSql = 'alter table '+data.name+' add columns ('+alterSql.join(',')+');';
                }
                resolve(returnSql);
            });
        });
    });
}
exports.execSql = execQuery;
exports.pool = pool;