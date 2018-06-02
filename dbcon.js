var mysql = require('mysql');
var pool = mysql.createPool({
  connectionLimit : 10,
  host            : [your host],
  user            : [your username],
  password        : [your password],
  database        : [your database],
  dateStrings	  : true
});

module.exports.pool = pool;
