var router = require('koa-router')(),
	db = require('../dbHelper');
router.get('/', function *(next) {
	// var rows = yield db.getObject('tb_pc_city', {city_id:200});
	/*yield db.getObject('tb_pc_city', {city_id:200})
		.then(function(rows){
			// console.log('-',rows);
		}, function(){
			console.log('error');
		}).then(function(){
			console.log('--');
		});
		console.log('0-0');*/
	this.session.user = null;
	console.log('用户登录');
    yield this.render('login', null);
});

router.get('/test', function *(next) {
	/*db.query('tb_bm_domain',{'domain_id':1},function(dt){
		console.log(dt)
	});*/
    yield this.render('login', null);
});
module.exports = router;