"use strict";
var router = require('koa-router')(),
    flowService = require('../services/flowService.js'),
    debug = require('debug')('jncl-flow'),
    CONST =  require('../common/const.js'),
    body = require('koa-better-body'),
    fs = require('fs'),
    path = require('path'),
    flowUploadPath = path.resolve(__dirname, '../../'),
    uploadPath = path.resolve(__dirname, '../../upload');

// console.log(path.resolve(__dirname, '../../upload'));
// console.log(path.join(__dirname, '../../upload').replace(/\\/g,'\\\\'));

var needle = require('needle');
var _flow = 'flow-';

(function(){
    if(!fs.existsSync(uploadPath)){
        fs.mkdirSync(uploadPath);
    }
}())

router.post('/getFlowList', function *(next) {
    try{
        var rows = yield flowService.getFlowList(this.request.body);
        this.body = {errorCode: CONST.SUCCESS_CODE, data: rows};
    }catch(e){
        this.body = {errorCode: CONST.ERROR_CODE, errorMsg: e};
    }
});

router.post('/addFlow', body(), function *(next) {
    try{
        var flowName = this.request.fields.name;
        var flowdesc = this.request.fields.desc;
        var fileName = this.request.files[0].name;
        var ver = '';//'1.00.';
        let newFlow = {
            name: flowName,
            desc: flowdesc,
            state: 'F0N',
            flow_zip: (ver + fileName),
            version: 1.00,
            isFirst: true
        };
        var rows = yield flowService.addFlow(newFlow);
        newFlow.flow_id = rows.insertId+'',
        newFlow.tmpath = this.request.fields.zip[0]['path'];

        // console.log(newPath);
        var rows = yield addFlow(newFlow);
        this.body = {errorCode: CONST.SUCCESS_CODE, data: rows,message : ''};
    }catch(e){
        console.log(e);
        this.body = {errorCode: CONST.ERROR_CODE, errorMsg: e};
    }
});
var addFlow = (newFlow)=>{
    return new Promise((resolve,reject)=>{
        var newPath = path.resolve(uploadPath, newFlow.flow_id);
        if(!fs.existsSync(newPath)){
            fs.mkdir(newPath, err =>{
                if(!err){
                    var stream = fs.createWriteStream(path.join(newPath, newFlow.flow_zip));
                    fs.createReadStream(newFlow.tmpath).pipe(stream);
                    //发布流程
                    releaseFlow(newFlow).then(dt=>{
                        resolve(1);
                    });
                }else{
                    reject(err);
                }
            });
        }else{
            reject('目录已存在.');
        }
    });
}
//识别目录
router.post('/saveRecognition',function *(next){
    var newPath = this.request.body.path;
        //path.join(flowUploadPath,this.request.body.path);
    // console.log(newPath);
    var num = yield readDirFile(newPath);
    this.body = {errorCode: CONST.ERROR_CODE, errorMsg:num};
});
//读取目录文件
let readDirFile = (newPath)=>{
    return new Promise((resolve,reject)=>{
        fs.readdir(newPath,function(err, files){
            if(err) {
                console.error(err);
                reject(err);
                return;
            } else {
                let promiseAll = [];
                files.forEach(function (file) {
                    //文件的地址
                    // console.log(file);
                    promiseAll.push(saveFile(newPath,file));
                });
                Promise.all(promiseAll).then(function(dt){
                    var num = 0;
                    dt.forEach(function(d){
                        if(d>0){
                            num+=d;
                        }
                    });
                    resolve(num);
                },function(err){
                    reject(err);
                });
            }
        });
    });
};
let saveFile = (newPath, file)=>{
    return new Promise((resolve,reject)=>{
        try{
            var ver = '';//'1.00.';
            var newFilePath = path.join(newPath, file);
            fs.stat(newFilePath, function (err, stat) {
                if(stat.isFile()) {
                    let filename = file.match(/([^\/]+)(?=\.)/ig)[0];
                    let fileN = (ver + file);
                    let newFlow = {
                        name: filename,
                        desc: '',
                        state: 'F0N',
                        flow_zip: fileN,
                        version: 1.00,
                        isFirst: true
                    };
                    flowService.addFlow(newFlow).then(function(rows){
                        newFlow.flow_id = rows.insertId;
                        var newUploadPath = path.resolve(uploadPath, rows.insertId+'');
                        var newUploadFilePath = path.resolve(newUploadPath, fileN);
                        if(!fs.existsSync(newUploadPath)){
                            fs.mkdir(newUploadPath, function(err){
                                if(!err){
                                    copyFile(newFilePath,newUploadFilePath);
                                    //发布流程
                                    releaseFlow(newFlow).then(dt=>{
                                        resolve(1);
                                    });
                                }else{
                                    debug(err);
                                }
                            });
                        }else{
                            copyFile(newFilePath,newUploadFilePath);
                            //发布流程
                            releaseFlow(newFlow).then(dt=>{
                                resolve(1);
                            });
                        }
                     });
                }
                if(stat.isDirectory()) {
                    resolve(0);
                    // console.log(newFilePath + ' is: ' + 'dir');
                }
            });
        }catch(e){
            console.log('上传error',e);
            resolve(0);
        }
    });
};
// function 
function copyFile(src, dst,callback,resolve) {
    var readable = fs.createReadStream( src );
    // 创建写入流
    var writable = fs.createWriteStream( dst );   
    // 通过管道来传输流
    readable.pipe(writable);
}
router.post('/updateFlow', body(), function *(next) {
    try{
        var fields = this.request.fields;
        var flow_id = fields.flow_id;
        var flowName = fields.name;
        var version = parseFloat(fields.version);
        let updatingFlow = {
            name: flowName,
            flow_id: flow_id,
            desc: fields.desc
        }

        if(this.request.fields.zip && fields.zip.length > 0){
            var newPath = path.resolve(uploadPath, flow_id);
            var fileName = this.request.files[0].name;
            // fileName = (version + 0.01) + fileName;
            var tmpath= fields.zip[0]['path'];
            if(!fs.existsSync(newPath)){
                fs.mkdirSync(newPath);
            };
            var stream = fs.createWriteStream(path.join(newPath, fileName));
            stream.on('error', function(err){
                console.log(err);
                this.body = {errorCode: CONST.ERROR_CODE, errorMsg: err};
            });
            fs.createReadStream(tmpath).pipe(stream);
            updatingFlow.flow_zip = fileName;
            updatingFlow.version = version + 0.01;
            var result = yield flowService.insertToHis({
                flow_id: flow_id,
                flow_zip: fields.flow_zip,
                version: version,
                upload_time: fields.create_time
            });
            debug('result', result);
            var dt = yield releaseFlow(updatingFlow);
            var rows = yield flowService.updateFlow(updatingFlow);
            this.body = {errorCode: CONST.SUCCESS_CODE, data: rows};
        }
    }catch(e){
        console.log(e);
        this.body = {errorCode: CONST.ERROR_CODE, errorMsg: e};
    }
});


router.post('/deleteFlow', function *(){
    try{
        var params = this.request.body;
        if(params){
            var row= yield deleteFlow(params);
            var rows = yield flowService.deleteFlow(params);
            this.body = {errorCode: CONST.SUCCESS_CODE, data: rows};
        }
    }catch(e){
        debug(e);
        this.body = {errorCode: CONST.ERROR_CODE, errorMsg: e};
    }

})

const options = {
    host: CONST.ITPORTAL_HOST,
    port: CONST.ITPORTAL_PORT,
    path: CONST.rootPath,                   // rootPath is /
    method: 'POST',
    url:CONST.ITPORTAL_HOST + ':' +CONST.ITPORTAL_PORT
}

function getJsession(){
    return new Promise((resolve, reject) => {
        needle.get(options.url+'/index', function(err, resp){
            if(err){
                debug(err);
                reject(err);
            }else{
                debug('getJsession success');
                resolve(resp.cookies);
            }
        })
    })
};

function login(jsession){
    return new Promise((resolve, reject) => {
        let data = {
            action: CONST.remoteLogin,
            username: CONST.BIGDATA,
            password: CONST.BIGDATA
        }
        // console.log(data);
        needle.request('post', options.url+'/index', data, {
            follow_max:5,
           headers: {
               Cookie: 'JSESSIONID='+jsession.JSESSIONID
            }
        }, (err, resp, body) =>{
            if(err) {
                debug('login err', err);
                reject(err);
            }else{
                debug('login success');
                var cookies = resp.cookies;
                cookies.JSESSIONID = jsession.JSESSIONID;
                resolve(cookies);
            }
        })
    })
};

function createProject(flow, cookie){
    return new Promise((resolve, reject) => {
        let temp = _flow + flow.name;
        let data = {
            action: CONST.remoteCreate,
            name: temp,
            description: temp
        }
        needle.request('post', options.url+'/manager', data, {
            headers: {
                Cookie: 'JSESSIONID='+cookie.JSESSIONID+'; azkaban.browser.session.id='+cookie['azkaban.browser.session.id']
            },
            follow_max:5
        }, (err, resp, body) =>{
            if(err) {
                debug('manager err', err);
                reject(err);
            }else{
                debug('create project success');
                resolve();
            }
        })
    })
};
//发布流程传文件
function uploadFile(flow, cookie){
    return new Promise((resolve, reject) => {
        try{
            let data = {
                action: CONST.remoteUpload,
                file:{
                    file: path.join(path.resolve(uploadPath, flow.flow_id+''), flow.flow_zip),
                    content_type : 'application/octet-stream'
                },
                project: _flow + flow.name
            }
            console.log('uploadFile----');
            needle.post(options.url+'/manager', data, {
                multipart: true,
                headers: {
                    Cookie: 'JSESSIONID='+cookie.JSESSIONID+'; azkaban.browser.session.id='+cookie['azkaban.browser.session.id']
                }
            }, function(err, resp){
                if(err){
                    debug(err);
                    reject(err);
                }else{
                    debug('upload file success');
                    resolve();
                }
            })
        }catch(e){
            debug(e);
            reject(e);
        }
    })
};

function addPermission(flow, cookie){
    return new Promise((resolve, reject) => {
        /*let params = {
            project:  _flow + flow.flow_id,
            name: CONST.WRITE,
            ajax: 'addPermission',
            'permissions[admin]':false,
            'permissions[read]':true,
            'permissions[write]':true,
            'permissions[execute]':false,
            'permissions[schedule]':false,
            'group':false
        };*/
        let url = options.url+`/manager?project=${_flow + flow.name}&name=${CONST.WRITE}&ajax=addPermission&permissions%5Badmin%5D=false&permissions%5Bread%5D=true&permissions%5Bwrite%5D=true&permissions%5Bexecute%5D=false&permissions%5Bschedule%5D=false&group=false`
        // console.log(url);
        needle.get(url, {
            headers: {
                Cookie: 'JSESSIONID='+cookie.JSESSIONID+'; azkaban.browser.session.id='+cookie['azkaban.browser.session.id']
            }
        }, (err, resp) =>{
            if(err){
                debug(err);
                reject();
                return;
            }else{
                debug('add permission success');
                resolve();
            }
        })
    })
}
//发布
router.post('release/', function *(){
    try{
        let flow = this.request.body;
        // console.log(flow);
        if(flow){
            /*let jsession = yield getJsession();
            let cookie = yield login(jsession);
            let name = flow.name;
            if(flow.isFirst == 0){
                yield createProject(flow, cookie);
                yield addPermission(flow, cookie);
            }
            yield uploadFile(flow, cookie);
            flow.isFirst = true;
            let rows = yield flowService.updateFlow(flow);*/
            //发布流程
            var dt = yield releaseFlow(flow);
            flow.isFirst = true;//已发布
            //保存流程
            var rows = yield flowService.updateFlow(flow)
            this.body = {errorCode: CONST.SUCCESS_CODE, data: rows};
        }else{
            debug('release error: flow is null');
            this.body = {errorCode: CONST.ERROR_CODE, errorMsg: '发布失败'};
        }
    }catch(e){
        debug('release error', e);
        this.body = {errorCode: CONST.ERROR_CODE, errorMsg: e};
    }
});
//发布流程
function releaseFlow(flow){
    return new Promise((resolve, reject) => {
        getJsession().then(jsession=>{
            login(jsession).then(cookie=>{
                 let name = flow.name;
                    createProject(flow, cookie).then(jsession=>{
                        addPermission(flow, cookie).then(()=>{
                            uploadFile(flow, cookie).then(()=>{
                                resolve(1);
                            });
                        });
                    });
            });
        });
    });
}
//删除流程
function deleteFlow(flow){
    return new Promise((resolve, reject) => {
        getJsession().then(jsession=>{
            login(jsession).then(cookie=>{
                let temp = _flow + flow.name;
                let data = {
                    project: temp,
                    delete: true
                }
                needle.request('get', options.url+'/manager', data, {
                    headers: {
                        Cookie: 'JSESSIONID='+cookie.JSESSIONID+'; azkaban.browser.session.id='+cookie['azkaban.browser.session.id']
                    },
                    follow_max:5
                }, (err, resp, body) =>{
                    if(err) {
                        debug('manager err', err);
                        reject(err);
                    }else{
                        debug('create project success');
                        resolve(1);
                    }
                });
            });
        });
    });
}
router.post('/check', function * (){
    try{
        let flow = this.request.body;
        flow.state = 'F0C';
        flow['state_time'] = new Date();
        var rows = yield flowService.updateFlow(flow);
        this.body = {errorCode: CONST.SUCCESS_CODE, data: rows};
    }catch(e){
        this.body = {errorCode: CONST.ERROR_CODE, data: e}
    }
});

router.post('/getFlowHisList', function * (){
    try{
        let flow = this.request.body;
        var rows = yield flowService.queryFlowHis(flow);
        this.body = {errorCode: CONST.SUCCESS_CODE, data: rows};
    }catch(e){
        debug('get flow his fail');
        debug(e);
        this.body = {errorCode: CONST.ERROR_CODE, data: e};
    }
})

module.exports = router;