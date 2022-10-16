const  express = require('express');
const  Accountrouter = express.Router();





	/* GET login page. */
	  Accountrouter.get('/login', function(req, res) {
    	// Display the Login page with any flash message, if any
		res.render('login');
	});


	/* GET Registration Page */
  Accountrouter.get('/register', function(req, res){
		res.render('signup');
	});





	/* Handle Logout */
  Accountrouter.get('/signout', function(req, res) {
		req.logout();
		res.redirect('/');
	});

module.exports=   Accountrouter
