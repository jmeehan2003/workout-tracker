var mysql = require('mysql');
var pool = mysql.createPool({
  connectionLimit : 10,
  host            : 'us-cdbr-iron-east-04.cleardb.net',
  user            : 'bef0bc73b59560',
  password        : 'b7cc499b',
  database        : 'heroku_fa00f92c3667a35',
  dateStrings	  : true
});

module.exports.pool = pool;
