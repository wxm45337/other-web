// var Router = require('koa-router');
var router = require('koa-router')(),
	analyseJson = require('../common/analyse-json');

router.get('/', function *(next) {
	console.log('index-----');
	// analyseJson.readFile('table.json');
    // yield this.render('index', null);
});
module.exports = router;