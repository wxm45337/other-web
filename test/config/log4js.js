
var log4js = require('log4js');
log4js.configure({   
  "appenders": [   
	  {"type": "console", "category": "console"},   
	  {        
	    "type": "dateFile",                 
	    "filename": "logs/",     
	    "pattern": "yyyyMMdd.txt",   
	    "absolute": true,                   
	    "alwaysIncludePattern": true,      
	    "category": "logInfo"            
	  } 
  ],  
  "levels":{ "logInfo": "DEBUG"}     


     
});