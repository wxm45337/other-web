"use strict";
let db = require('../dbHelper');
let debug = require('debug')('jncl-flowService');

let getFlowList = (params)=>{
    return new Promise((resolve,reject)=>{

        let sql = 'SELECT * FROM tb_bm_flow';

        if(params && params.name){
            sql = sql + ' WHERE name like ?';
        }

        db.execSql(sql, params.name ? [`%${params.name}%`] : null, (err, data)=>{
            if(err) {
                reject('查询失败');
            }else{
                resolve(data);
            }
        });

    });
};

let addFlow = (params) =>{
    return new Promise((resolve,reject) => {
        db.add('tb_bm_flow', params).then(data => {
            resolve(data);
        }, (err) => {
            console.log('error', err);
            reject(err);
        })
    })
};

let updateFlow = (params) => {
    return new Promise( (resolve,reject) => {
        db.update('tb_bm_flow', params, {flow_id:params.flow_id}).then(data => {
            resolve(data);
        }, err => {
            console.log(err);
            reject(err);
        })
    })
};

let deleteFlow = (params) =>{
    return new Promise((resolve,reject)=>{
        db.deleteObject('tb_bm_flow', {flow_id: params.flow_id}, (err, data) => {
            if(err) {
                console.log(err);
                reject(err);
            }else{
                resolve(data);
            }
        })
    })
};

let insertToHis = function(params){
    return new Promise((resolve,reject) => {
        db.add('tb_bm_flow_his', params).then(data => {
            resolve(data);
        }, (err) => {
            console.log('error', err);
            reject(err);
        })
    })
};

let queryFlowHis = function(flow){
    return new Promise((resolve,reject) => {
        let sql = `SELECT * FROM tb_bm_flow_his WHERE flow_id=${db.pool.escape(flow.flow_id)}`;
        debug('query flow hsi sql: ', sql);
        db.execSql(sql, (err, data) => {
            if(err){
                reject();
            }else{
                resolve(data);
            }
        });
    });
};


module.exports = {
    getFlowList: getFlowList,
    addFlow: addFlow,
    updateFlow: updateFlow,
    deleteFlow: deleteFlow,
    insertToHis: insertToHis,
    queryFlowHis: queryFlowHis
}
