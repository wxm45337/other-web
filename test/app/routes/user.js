var router = require('koa-router')();

// var promisify = require("promisify-node");
// var db = require("../dbHelper");

router.get('/list', function *(next) {
	console.log('user list---',this.params,this.query);
	this.body = {id:'111'};
    // yield this.render('index', {id:1,name:2});
});
router.get('/', function *(next) {
	console.log('user---',this.params,this.query);
	this.body = {id:'111'};
    // yield this.render('', {id:1});
});
module.exports = router;