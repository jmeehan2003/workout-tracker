/*****************************************
** Author: James Meehan
** Course: CS290
** Assignment: Database User Interactions
** Date: 12/1/2017
****************************************/

// set everything up
var express = require('express');
var mysql = require('./dbcon.js');
var bodyParser = require('body-parser');

var app = express();
var handlebars = require('express-handlebars').create({defaultLayout:'main'});
var path = require('path');
var session = require('express-session');


//more setup
app.engine('handlebars', handlebars.engine);
app.use(bodyParser.urlencoded({extended:true}));
app.use('/static', express.static('public'));
app.set('view engine', 'handlebars');
app.set('port', process.env.PORT);
app.set('mysql', mysql);

app.use(express.static(path.join(__dirname, '/public')));

// provided by the instructor
app.get('/reset-table',function(req,res,next){
    var context = {};
    mysql.pool.query("DROP TABLE IF EXISTS workouts", function(err){
        var createString = "CREATE TABLE workouts("+
        "id INT PRIMARY KEY AUTO_INCREMENT,"+
        "name VARCHAR(255) NOT NULL,"+
        "reps INT,"+
        "weight INT,"+
        "date DATE,"+
        "lbs BOOL)";
        mysql.pool.query(createString, function(err){
            res.render('home',context);
        })
    });
});

// use express to render table on initial page view
app.get('/', function(req, res, next){
    var context = {};
   // console.log("I got a get request");
     mysql.pool.query("SELECT id, reps, name, weight, DATE_FORMAT(date, '%m-%d-%Y') AS date, lbs FROM workouts", function(error, results, fields){
     if(error){
          next(error);
          return;
     }
    
     context.workouts = results;
 
     res.render("home", context);
   });
});	

// ajax delete
app.get('/delete/:id', function(req, res){
        var sql = "DELETE FROM workouts WHERE id = ?";
        var inserts = [req.params.id];
        sql = mysql.pool.query(sql, inserts, function(error, results, fields){
            if(error){
                res.write(JSON.stringify(error));
                res.status(400);
                res.end();
            }else{
                res.status(202).end();
            }
        });
    });
    
// for use with update    
function getExercise(res, mysql, context, id, complete){
        var sql = "SELECT id, name, reps, weight, DATE_FORMAT(date, '%Y-%m-%d') AS date, lbs FROM workouts WHERE id=?";
        var insertId=[id];
        mysql.pool.query(sql, insertId, function(error, results, fields){
            if(error){
                res.write(JSON.stringify(error));
                res.end();
            }
            context.workout  = results[0];
            complete();
        });
}

// ajax interaction from homepage -- no refresh
app.get('/insert',function(req,res,next){
  var context = {};
  
  //convert invalid/empty strings to null
  if(req.query.date == "")
    req.query.date = null;
  if(req.query.reps== "")
    req.query.reps = null;
  if(req.query.weight== "")
     req.query.weight = null;

    mysql.pool.query("INSERT INTO `workouts` (`name`, `reps`, `weight`, `date`, `lbs`) VALUES (?, ?, ?, ?, ?)", 
    [req.query.name, 
    req.query.reps, 
    req.query.weight, 
    req.query.date, 
    req.query.units], 
    function(error, result){
        if(error){
            var msg = JSON.stringify(error);
    	    var read_msg = JSON.parse(msg);
    	    var err_msg = read_msg.sqlMessage;
    	    res.set('content-Type', 'text/html');
        	res.write("<h1>Something has gone wrong.</br></h1><p>You received the following error message:</p></br>");
    	    res.write(err_msg);
    	    res.write("</br><p>To return to the previous page click <a href='/'>here</a></p>");
                res.end();
        } 
	    context.inserted = result.insertId;
        res.send(JSON.stringify(context));
  });
});

// take user to update page  
app.get('/newupdate/:id', function (req, res, next){
        var callbackCount = 0;
        var context = {};
        var mysql = req.app.get('mysql');
        getExercise(res, mysql, context, req.params.id, complete);
        function complete(){
            callbackCount++;
            if(callbackCount >= 1){
                res.render('update', context);
            }

        }
    });

  // update data in database
  app.get('/update/:id', function(req, res){
   //   console.log("INSIDE UPDATE!");
      var context = {};
  
	
	// change invalid strings to null
        if(req.query.date == "")
        req.query.date = null;
        if(req.query.reps== "")
        req.query.reps = null;
        if(req.query.weight== "")
        req.query.weight = null;
       
        var sql = "UPDATE workouts SET name=?, reps=?, weight=?, date=?, lbs=? WHERE id=?";
        var inserts = [req.query.name, req.query.reps, req.query.weight, req.query.date, req.query.units, req.params.id];


        mysql.pool.query(sql,inserts,function(error, results, fields){
            if(error){
	        var msg = JSON.stringify(error);
                res.write(msg.sqlMessage);
                res.end();
            }
        });
           res.render('home', context);
    });

app.use(function(req,res){
    res.status(404);
    res.render('404');
});

app.use(function(err, req, res, next){
    console.error(err.stack);
    res.type('plain/text');
    res.status(500);
    res.render('500');
});
    
app.listen(app.get('port'), function() {
    console.log('Express started on ' + app.get('port') + '; Press control-C to stop.');
});
