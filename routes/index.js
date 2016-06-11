var express = require('express');
var router = express.Router();
var mysql = require('mysql');
//var validator = require("email-validator");



  var connectionPool =  mysql.createPool({
    connectionLimit: 500,
  host : 'localhost',
  user : 'root',
  password: 'password',
  database : 'CREDENTIALS'
  });


router.post('/logout',function(req,res,next){
  if(req.session && req.session.username){
	req.session.destroy();
  res.send('You have been logged out');
}
else{
  res.send('You are not currently logged in');
}
});

router.post('/login',function(req,res,next){

	
try{
/*var connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : 'password',
  database : 'CREDENTIALS'
});
connection.connect(function(err){
  if(!err){
    console.log("Database Connected");
  }
  else{
    console.log("Issue with db connection");
  }
});*/
connectionPool.getConnection(function(err,conn){
  if(err){
    conn.release();
    console.log('Error in getting connection from pool');
    return;
  }

conn.changeUser({database : 'CREDENTIALS'}, function(err) {
  if (err) console.log('Error while changing db');
});
var username = req.body.username;
var password = req.body.password;
console.log('UserName:' + username);
conn.query('SELECT firstname,password,role from USERS where username=?',username, function(err, rows, fields) {
  conn.release();
  if (!err){
  	if(rows.length != 1){
  		res.send('There seems to be an issue with the username/password combination that you entered');
  	}
    else{
  	if(rows[0].password === password) {
      var firstName = rows[0].firstname;

      if(req.session && req.session.username === username){
        console.log('User:' + username + ' already logged in. Killing session:' + req.session.sessionId);
        req.session.regenerate(function(err){
          req.session.username = username;
        });
        
      }
      console.log( req.sessionID);
      var expiryTime =  15 * 60 * 1000; 
      req.session.cookie.expires = new Date(Date.now() + expiryTime);
  		req.session.username = username;
      req.session.admin = rows[0].role;
      console.log('Req Admin' + req.session.admin);
      console.log(' Created session:' + req.session.cookie.expires);
		  res.send( 'Welcome ' + firstName);
    }
    else{
      res.send('There seems to be an issue with the username/password combination that you entered');
    }
  } 
}
 else{
      console.log('Error while performing query');
    }
    
});
});
}
catch(e){
  console.log('Exception caught' + e)
  
}


	
});


router.get('/', function(req, res, next) {
  res.send('{Message: Lets get going }');
});

router.get('/login',function(req,res){
  res.render('login');
});

router.get('/register',function(req,res){
  res.render('register');
});

router.post('/registerUser', validateRegister, function(req,res,next){
 connectionPool.getConnection(function(err,conn){
  if(err){
    conn.release();
    console.log('Error in getting connection from pool');
    return;
  }
  console.log('Connected to DB as :' + conn.threadId);
  console.log('Register UserName' + req.body.username);
  var record = {firstname: req.body.fname , lastname: req.body.lname, address: req.body.address, city: req.body.city, state: req.body.state,
    zip: req.body.zip, email: req.body.email, username: req.body.username, password: req.body.password};

    //console.log('Record:' + typeof record);
  conn.query('INSERT INTO USERS SET ?', record, function(err){
    conn.release();
    if(err){
      console.log('Error while persisting record' + err);
      res.send('There was a problem with your registration');
    }
    else{
      console.log('Registered successfully');
      res.send('Your account has been registered');
    }
    
  });
  

 })

});

router.post('/updateInfo', function(req,res,next){
  if(req.session && req.session.username){

    console.log('First:' + req.body.firstname);
    if(typeof req.body.fname === 'undefined'){
     // record = record + 'firstname:'+ req.body.firstname + ',';
      //console.log('Record:' + record);
      req.body.fname = null;
    }
     if(typeof req.body.lname === 'undefined'){
      //record = record + 'lastname:' + req.body.lastname + ',';
      //console.log('Record:' + record);
      req.body.lname = null;
    }
     if(typeof req.body.address === 'undefined'){
    //record = record + 'address:' + req.body.address + ',';
      //console.log('Record:' + record);
      req.body.address = null;
    }
     if(typeof req.body.city === 'undefined'){
//record = record + 'city:' + req.body.city + ',';
      //console.log('Record:' + record);
      req.body.city= null;
    }
     if(typeof req.body.state === 'undefined'){
//record = record + 'state:' + req.body.state + ',';      //console.log('Record:' + record);
  req.body.state = null;
    }
     if(typeof req.body.zip === 'undefined') {
//record = record + 'zip:' + req.body.zip + ',';      //console.log('Record:' + record);
req.body.zip = null;
    }
     if(typeof req.body.email === 'undefined' ){
//record = record + 'email:' + req.body.email + ',';      //console.log('Record:' + record);
    req.body.email = null;
    }
     if(typeof req.body.username === 'undefined' ){
//record = record + 'username:' + req.body.username + ',';      //console.log('Record:' + record);
    req.body.username = null;
    }
     if(typeof req.body.password === 'undefined'){
      req.body.password = null;
//record = record + 'password:' + req.body.password + ',';      //console.log('Record:' + record);
    }
    //record = record.slice(0,-1);
    //record = record + '}';
    //eval('var obj='+record);
    /*var jsonRecord = JSON.parse(JSON.stringify(record));
    console.log('Final Record:' + jsonRecord);
    console.log(typeof jsonRecord);*/
    //console.log('Final record:' + record);
connectionPool.getConnection(function(err,conn){
  if(err){
    conn.release();
    console.log('Error in getting connection from pool');
    return;
  }
    console.log('Connected to DB as :' + conn.threadId);
  conn.changeUser({database : 'CREDENTIALS'}, function(err) {
  if (err) console.log('Error while changing database');
});

  console.log(req.body.username);
  conn.query('UPDATE USERS SET firstname = IfNULL(?,firstname), lastname = IfNULL(?, lastname), address = IfNULL(?, address), state = IfNULL(?, state), city = IfNULL(?, city), zip = IfNULL(?, zip),'
    +' email = IfNULL(?, email), username = IfNULL(?, username), password = IfNULL(?, password) where username=?', [req.body.fname,req.body.lname,req.body.address,req.body.state,req.body.city,req.body.zip,req.body.email,req.body.username,req.body.password,req.session.username], function(err){
    conn.release();
    if(err){
      console.log('Error while persisting record' + err);
      res.send('There was a problem with this action');
    }
    else{
      console.log('Your information has been updated');
      if(typeof req.body.username !== 'undefined' || req.body.username !== ''){
      req.session.username = req.body.username;
    }
      res.send('Your information has been updated');

    }
    
  });

})
}
else{
  res.send('You must be logged in to perform this action');
}
});

router.post('/addProducts',function(req,res,next){
  //console.log('Req session:' + req.session);
  //console.log('Req admin:' + req.session.admin);
  if(req.session && req.session.admin == 1){
    if(req.body.productId === '' || typeof req.body.productId === 'undefined' || req.body.name === '' || typeof req.body.name ==='undefined' || req.body.productDescription === '' || typeof req.body.productDescription ==='undefined' || req.body.group === '' || typeof req.body.group ==='undefined'){
    console.log('All parameters required');
    res.send('There was a problem with this action');
    return;
  }
    var product_info = {productId: req.body.productId, name: req.body.name, productDescription: req.body.productDescription, group: req.body.group};
      connectionPool.getConnection(function(err,conn){
  if(err){
    conn.release();
    console.log('Error in getting connection from pool');
    return;
  }
conn.changeUser({database : 'PRODUCT_INFO'}, function(err) {
  if (err) console.log(err);
});
  conn.query('INSERT INTO PRODUCTS SET ?', product_info, function(err) {
  //conn.query('INSERT INTO PRODUCTS (productId, `name`, productDescription, `group`) values (?,?,?,?)', [req.body.productId,req.body.name,req.body.productDescription,req.body.group], function(err){
       conn.release();

    if(err){
      console.log('Error while persisting record' + err);
      res.send('There was a problem with this action');
    }
    else{
      //console.log('Registered successfully');
      res.send('The product has been added to the system');
    }
    });
});
  }
else if(req.session && req.session.admin ==0){
  res.send('Only admin can perform this action');
}
else{
  res.send('You must be logged in to perform this action');
}
});

router.post('/viewProducts', function(req,res,next){
  connectionPool.getConnection(function(err,conn){
  if(err){
    conn.release();
    console.log('Error in getting connection from pool');
    return;
  }
  console.log('ConnectionID:' + conn.threadId);
  var executer='';
  if(typeof req.body.productId === 'undefined' && typeof req.body.group ==='undefined' && typeof req.body.keyword === 'undefined'){
    executer = 'select name from products';
  }
  else{

   executer = 'select name from products where ';
   if(typeof req.body.productId !== 'undefined'){
    //req.body.productId = null;
    executer += 'productId = '+ conn.escape(req.body.productId)+' or';
  }
   if(typeof req.body.group !== 'undefined'){
    //req.body.group = null;
    executer += ' `group` = '+ conn.escape(req.body.group)+' or';
  }
  if(typeof req.body.keyword !== 'undefined'){

    var description = '%' + req.body.keyword + '%';
      executer += ' productDescription like '+conn.escape(description)+' or name like '+conn.escape(description)+' or';
  }
  executer = executer.slice(0,-2);
  }
conn.changeUser({database : 'PRODUCT_INFO'}, function(err) {
  if (err) console.log(err);
});
//console.log(executer);
conn.query(executer, function(err,results){
      conn.release();
if(!err){
  if(results.length > 0){
    var userList = ['name:' + results[0].name];
    for (var i =1 ; i < results.length; i++) {
      userList.push('name:' + results[i].name);
    }
    res.send(userList);
  }
  else{
    res.send('There were no products in the system that met that criteria');
  }
  
}
else{
  console.log(err);
  res.send('Issue while performing query');
}
})  

});
});

router.post('/viewUsers', function(req,res,next){
if(req.session && req.session.admin ==1){
  connectionPool.getConnection(function(err,conn){
  if(err){
    conn.release();
    console.log('Error in getting connection from pool');
    return;
  }
conn.changeUser({database : 'CREDENTIALS'}, function(err) {
  if (err) console.log(err);
});
var executer = '';
if(typeof req.body.fname === 'undefined' && typeof req.body.lname === 'undefined'){
  executer = 'select firstname,lastname from users';
}
else{
    executer = 'select firstname,lastname from users where';
  if(typeof req.body.fname !== 'undefined'){
    var fname = '%' + req.body.fname + '%';
    executer += ' firstname like '+conn.escape(fname)+' or';
  }
   if(typeof req.body.lname !== 'undefined'){
    var lname = '%' + req.body.lname + '%';
    executer += ' lastname like '+conn.escape(lname)+' or';
  }
  executer = executer.slice(0,-2);
}
console.log(executer);
conn.query(executer,function(err,results){
      conn.release();
if(!err){
  if(results.length > 0){
    var userList = [];
    for (var i =0 ; i < results.length; i++) {
      userList.push(results[i].firstname + ' ' + results[i].lastname);
    }
    res.send(userList);
  }
  else{
    res.send('There are no users matching your search criteria');
  }
}
else{
  console.log(err);
  res.send('Issue while performing query');
}
});
})
}
else if(req.session && req.session.admin == 0){
  res.send('Only admin can perform this action');
}
else{
  res.send('You must be logged in to perform this action');
}
}) ;

router.post('/modifyProduct', function(req,res,next){

  if(req.session && req.session.admin ==1) {
  if(typeof req.body.name === 'undefined' || typeof req.body.productDescription === 'undefined' ||typeof req.body.productId === 'undefined'){
    console.log('In validation');
    res.send('There was a problem with this action');
    return;
  }
  connectionPool.getConnection(function(err,conn){
  if(err){
    conn.release();
    console.log('Error in getting connection from pool');
    return;
  }
conn.changeUser({database : 'PRODUCT_INFO'}, function(err) {
  if (err) console.log(err);
});
//var record = {name:req.body.name, productDescription: req.body.productDescription};
console.log('Executing Update' + req.body.name + ' ' + req.body.productDescription + '  ' + req.body.productId);
conn.query('update `products` set `productDescription` = ?,`name` = ? where `productId` = ?' ,[req.body.productDescription, req.body.name, req.body.productId], function(err){
    conn.release();
if(!err){

  res.send('The product information has been updated');
}
else{
  console.log(err);
  res.send('There was a problem with this action');
}
})  
//conn.release();
});
}
else if (req.session && req.session.admin ==0){
  res.send('Only admin can perform this action');
}
else{
  res.send('You must be logged in to perform this action');
}
});


function validateRegister(req,res,next){
  if(typeof req.body.fname === 'undefined' || typeof req.body.lname === 'undefined' ||typeof req.body.address === 'undefined' || 
    typeof req.body.city === 'undefined' ||typeof req.body.zip === 'undefined' || typeof req.body.email === 'undefined' ||
    typeof req.body.username === 'undefined' ||typeof req.body.password === 'undefined'){
    console.log('In validateRegister');

    res.send('There was a problem with your registration');
    return;
  }

 else if( req.body.fname === '' ||  req.body.lname === '' || req.body.address === '' || 
     req.body.city === '' || req.body.zip === '' ||  req.body.email === '' ||
     req.body.username === '' || req.body.password === ''){
    console.log('In validateRegister');

    res.send('There was a problem with your registration');
    return;
  }
  /*else if( isNaN(req.body.zip) || req.body.zip.length != 5 || req.body.state.length<2){
        console.log('In zip code and state');

    res.send('There was a problem with your registration');
    return;
  }
  else if(!validator.validate(req.body.email)){
        console.log('In email');

    res.send('There was a problem with your registration');
    return;
  }*/
  else{
    next();
  }
}



module.exports = router;
