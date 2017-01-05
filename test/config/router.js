var router = require('koa-router')(),
	path = require('path');

var env = process.env.NODE_ENV,
	_dirname = path.join(__dirname, '../' + env);

var index = require(path.join(_dirname, 'routes/index')),
	login = require(path.join(_dirname, 'routes/login')),
	user = require(path.join(_dirname, 'routes/user')),
	domain = require(path.join(_dirname, 'routes/domain')),
	table = require(path.join(_dirname, 'routes/table')),
	flow = require(path.join(_dirname, 'routes/flow')),
	commonApi = require(path.join(_dirname, 'routes/commonApi')),
	sshterm = require(path.join(_dirname, 'routes/sshterm'));

//路由配置
router.use('/',index.routes(),index.allowedMethods());
router.use('/login',login.routes(),login.allowedMethods());
router.use('/user',user.routes(),user.allowedMethods());
router.use('/table',table.routes(),table.allowedMethods());
router.use('/flow',flow.routes(),table.allowedMethods());
router.use('/domain',domain.routes(),domain.allowedMethods());
router.use('/commonApi',commonApi.routes(),commonApi.allowedMethods());
router.use('/sshterm',sshterm.routes(),sshterm.allowedMethods());

module.exports = router;