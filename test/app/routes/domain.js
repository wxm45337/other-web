var router = require('koa-router')(),
	JSONTableService = require('../services/json-table');

var domainsRouter = function *(next) {
	// console.log(this.request.body);
	var rows = yield JSONTableService.queryDomains(this.request.body);
	this.body = rows;
};

router.get('/', domainsRouter)
	.post('/', domainsRouter);

module.exports = router;