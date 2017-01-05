"use strict";
var router = require('koa-router')(),
    debug = require('debug')('jncl-commonApi'),
    CONST =  require('../common/const.js'),
    body = require('koa-better-body'),
    fs = require('fs'),
    path = require('path'),
    node_ssh = require('node-ssh'),
    ssh = new node_ssh();
var Client = require('ssh2').Client;

router.post('/upload', body(), function * (){
    try{
        let fields = this.request.fields;
        let files = [];
        fields.file.forEach(obj => {
            debug(path.join(fields.path, obj.name));
            files.push( {local: obj.path, remote: fields.path+'/'+obj.name} );
        })
        yield ssh.connect( {host: fields.host, username: fields.user, password: fields.password} );
        /*var t = 'if [ -d '+ fields.path +' ]; then echo \"exist\"; else echo \"no exist\"; fi';
        debug(t);
        var re = yield ssh.execCommand(t);
        if(re.stdout == 'no exist'){
            yield ssh.mkdir(fields.path);
        }*/
        yield ssh.putFiles(files);
        this.body = {errorCode: CONST.SUCCESS_CODE};
    }catch(e){
        debug(e);
        this.body = {errorCode: CONST.ERROR_CODE, data: e};
    }
});

var sftp = function(fields){
    return new Promise((resolve, reject) => {
        var conn = new Client();
        conn.on('ready', function() {
            debug('Client :: ready');
            conn.sftp(function(err, sftp) {
                if (err) reject(err);
                sftp.readdir(fields.path, function(err, list) {
                    if (err) reject(err);
                    resolve(list);
                    conn.end();
                });
            });
        }).connect({
            host: fields.host,
            port: 22,
            username: fields.user,
            password: fields.password
        });
    });
}

router.post('/sftp', function * (){
    try{
        let fields = this.request.body;
        let list = yield sftp(fields);
        this.body = {errorCode: CONST.SUCCESS_CODE, data: list};
    }catch(e){
        debug('sftp error', e);
        this.body = {errorCode: CONST.ERROR_CODE, data: e};
    }

})

module.exports = router;