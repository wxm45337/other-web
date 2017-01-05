var router = require('koa-router')(),
    tableService = require('../services/tableService');
    foreignService = require('../services/foreignService');

router.post('/getTable', function *(next) {
    console.log('table-----', this.request.body);

    var rows = yield tableService.getTable(this.request.body.data.table_id);

    this.body = rows;
    //yield this.render('table', null);
});

router.post('/getTableColumn', function *(next) {
    console.log('table-----', this.request.body);

    var rows = yield tableService.getTableColumn(this.request.body.data.table_id);

    this.body = rows;
    //yield this.render('table', null);
});

router.post('/getTableForeign', function *(next) {
    console.log('~~~~~~~~~~~~~~~~~~~',this.request.body);
    var rows = yield tableService.getTableForeign(this.request.body.data.table_id);

    this.body = rows;
    //yield this.render('table', null);
});

router.post('/getTableHistory', function *(next) {
    console.log('~~~~~~~~~~~~~~~~~~~',this.request.body);
    var rows = yield tableService.getTableHistory(this.request.body.data.table_id);

    this.body = rows;
    //yield this.render('table', null);
});

router.post('/newTable', function *(next) {
    console.log('~~~~~~~~~~~~~~~~~~~',this.request.body);
    var rows = yield tableService.newTable(this.request.body.data);

    this.body = rows;
    //yield this.render('table', null);
});

router.post('/newTableColumn', function *(next) {
    console.log('~~~~~~~~~~~~~~~~~~~',this.request.body.data);
    var rows = yield tableService.newTableColumn(this.request.body.data);

    this.body = rows;
    //yield this.render('table', null);
});

router.post('/newTableForeign', function *(next) {
    var rows = yield tableService.newTableForeign(this.request.body.data);

    this.body = rows;
    //yield this.render('table', null);
});

router.post('/newTableHistory', function *(next) {
    var rows = yield tableService.newTableHistory(this.request.body.data);

    this.body = rows;
    //yield this.render('table', null);
});

router.post('/updateTable', function *(next) {
    // console.log('table-----', this.request.body.table);
    var rows = yield tableService.updateTable(this.request.body.data, this.request.body.data.table_id);
    this.body = rows;
    //yield this.render('table', null);
});

var listByDomain = function *(next) {
	// console.log(this.request.body);
	var rows = yield tableService.getTableByDomain(this.request.body);
	// console.log(rows);
	this.body = rows;
};

var getForeignByDomain = function *(next) {
    var rows = yield foreignService.getForeignByDomain(this.request.body||0);
    this.body = rows;
};


router
	.get('/listByDomain', listByDomain)
	.post('/listByDomain', listByDomain)
    .post('/foreign', getForeignByDomain);
module.exports = router;