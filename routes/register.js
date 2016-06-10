var express = require('express');
var router = express.Router();
var mysql = require('mysql');

/*var connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : 'password',
  database : 'CREDENTIALS'
});*/

  var connectionPool =  mysql.createPool({
  host : 'localhost',
  user : 'root',
  password: 'password',
  database : 'CREDENTIALS'
  });


router.get('/',function(req,res){
  res.send('register');
});

router.post('/registerUser', validateRegister, function(req,res,next){
 connectionPool.getConnection(function(err,conn){
  if(err){
    conn.release();
    console.log('Error is getting connection from pool');
    return;
  }
  console.log('Connected to DB as :' + conn.threadId);
  console.log('Firstname' + req.body.firstname);
  var record = {firstname: req.body.firstname , lastname: req.body.lastname, address: req.body.address, city: req.body.city, state: req.body.state,
    zip: req.body.zip, email: req.body.email, username: req.body.username, password: req.body.password};
  conn.query('INSERT INTO USERS SET ?', record, function(err){
    if(err){
      console.log('Error while persisting record' + err);
      res.send('There was a problem with your registration');
    }
    else{
      console.log('Registered successfully');
      res.send('Your account has been registered');
    }
    conn.release();
  })

 })

});

function validateRegister(req,res,next){
  if(typeof req.body.firstname === 'undefined' || typeof req.body.lastname === 'undefined' ||typeof req.body.address === 'undefined' || 
    typeof req.body.city === 'undefined' ||typeof req.body.zip === 'undefined' || typeof req.body.email === 'undefined' ||
    typeof req.body.username === 'undefined' ||typeof req.body.password === 'undefined'){
    res.send('There was a problem with your registration');
    return;
  }
}



module.exports = router;
