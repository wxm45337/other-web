var app = require('koa')(),
	// logger = require('koa-logger'),
	json = require('koa-json'),
	views = require('koa-views'),
	//session = require('koa-session'),
	session = require('koa-generic-session'),
 	// redisStore = require('koa-redis'),
 	bodyParser = require('koa-bodyparser'),
	validator = require('koa-validator'),
	hbs = require('koa-hbs'),
	log4js = require('./log4js'),
	path = require('path');

var serve = require('koa-static');

var env = process.env.NODE_ENV;

var _dirname = path.join(__dirname, '../' + env);

app.name = 'dpi-koa';
app.keys = ['some secret hurr'];

//配置views
// app.use(hbs.middleware({
// 	viewPath: path.join(_dirname,  'views'),
// 	extname: '.html'
// }));

app.use(json());
// app.use(logger());
//app.use(session(app));
// app.use(session());
app.use(bodyParser());
app.use(validator({
    onValidationError: function(errMsg){
      	console.log('Validation error:', errMsg);
    }
}));

app.use(function *(next){
  // var n = this.session.user || 0;
  if(this.url != '/logo.ico' && this.url !='/favicon.ico' &&
  	this.url.indexOf('/login')!=0){
	  // if(this.session.user && this.session.user.id >= 0){
	  // 		console.log('用户已登录');
			// yield next;
	  // }else{
	  // 		this.redirect('/login');
	  // }
	}
	yield next;
});

//静态文件
app.use(require('koa-static')(__dirname+ '/public'));

/*app.use(function *notFound(next){
	console.log(this);
	if(this.status == 404){
		console.log('404错误');
		yield next;
	}else{
		yield next;
	}
});*/

var router = require('./router');
//app嵌入路由
app.use(router.routes());


app.on('error',function(err,ctx){
	log.error('server error',err,ctx);
});

module.exports = app;