var express= require("express");
var router= express.Router();
var passport = require("passport");
var User = require("../models/user");
var middleware = require("../middleware/index.js");
var artwork = require("../models/artworks");
var async = require("async");
var nodemailer = require("nodemailer");
//crypto is part of express no need to insatall is
var crypto = require("crypto");

router.get("/",function(req,res)
	   {
	res.render("landing");
	//res.send("this will be the landing page soon");
});

//===================
//Auth Routes
//===================

//show register form
router.get("/register",function(req,res){
	res.render("register",{page: 'register'});
});

//handle sign up logic
router.post("/register",function(req,res){
	//then we're passing in this new user that only has a user name assigned and register is going tohandle all the logic of taking that password and then rather than storing the password it actually storesthat crazy hash.
	
	var newUser = new User(
		{
			username: req.body.username,
	        firstName:	req.body.firstName,
			lastName: req.body.lastName,
			email: req.body.email
		});
	//check user is admin or not
	if(req.body.adminCode ==  process.env.ADMIN_CODE){
		newUser.isAdmin = true;
	}
	
   User.register(newUser,req.body.password,function(err,user){
	   if(err)
		   {
			    console.log(err);
    return res.render("register", {error: err.message});
		   }
	   passport.authenticate("local")(req,res,function(){
		   req.flash("success","Welcome to ArtGallery "+ user.username);
		   res.redirect("/artworks");
		   console.log(newUser);
	   });
   }); 
	
});



//show login form
router.get("/login",function(req,res){
	res.render("login",{page: "login"});
});

//handling login logic
//app.post("/login,middleware,calll back)
router.post("/login",passport.authenticate("local",
		{   
	        successRedirect: "/artworks",
	         failureRedirect:"/login",
	         failureFlash:true,
        }),					
	function(req,res){
});



//logout route
router.get("/logout", function(req,res){
	req.logout();
	req.flash("success","Logged You Out");
	res.redirect("/artworks");
});


//FORGOT PASSWORD
// forgot password
router.get('/forgot', function(req, res) {
  res.render('forgot');
});

router.post('/forgot', function(req, res, next) {
  async.waterfall([
    function(done) {
      crypto.randomBytes(20, function(err, buf) {
        var token = buf.toString('hex');
        done(err, token);
      });
    },
    function(token, done) {
      User.findOne({ email: req.body.email }, function(err, user) {
        if (!user) {
          req.flash('error', 'No account with that email address exists.');
          return res.redirect('/forgot');
        }

        user.resetPasswordToken = token;
        user.resetPasswordExpires = Date.now() + 3600000; // 1 hour

        user.save(function(err) {
          done(err, token, user);
        });
      });
    },
    function(token, user, done) {
      var smtpTransport = nodemailer.createTransport({
        service: 'Gmail', 
        auth: {
          user: 'agrawalprerna1999@gmail.com',
			pass: process.env.GMAILPW
			//export GMAILPW=yourpassword

        }
      });
      var mailOptions = {
        to: user.email,
        from: 'agrawalprerna1999@gmail.com',
        subject: ' Password Reset',
        text: 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
          'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
          'http://' + req.headers.host + '/reset/' + token + '\n\n' +
          'If you did not request this, please ignore this email and your password will remain unchanged.\n'
      };
      smtpTransport.sendMail(mailOptions, function(err) {
		  if (err) return next(err);
        console.log('mail sent');
        req.flash('success', 'An e-mail has been sent to ' + user.email + ' with further instructions.');
        done(err, 'done');
      });
    }
  ], function(err) {
    if (err) return next(err);
    res.redirect('/forgot');
  });
});


router.get('/reset/:token', function(req, res) {
  User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
    if (!user) {
      req.flash('error', 'Password reset token is invalid or has expired.');
      return res.redirect('/forgot');
    }
    res.render('reset', {token: req.params.token});
  });
});


router.post('/reset/:token', function(req, res) {
  async.waterfall([
    function(done) {
      User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
        if (!user) {
          req.flash('error', 'Password reset token is invalid or has expired.');
          return res.redirect('back');
        }
        if(req.body.password === req.body.confirm) {
          user.setPassword(req.body.password, function(err) {
            user.resetPasswordToken = undefined;
            user.resetPasswordExpires = undefined;

            user.save(function(err) {
              req.logIn(user, function(err) {
                done(err, user);
              });
            });
          })
        } else {
            req.flash("error", "Passwords do not match.");
            return res.redirect('back');
        }
      });
    },
    function(user, done) {
      var smtpTransport = nodemailer.createTransport({
        service: 'Gmail', 
        auth: {
          user: 'learntocodeinfo@gmail.com',
          pass: process.env.GMAILPW
        }
      });
      var mailOptions = {
        to: user.email,
        from: 'agrawalprerna1999@gmail.com',
        subject: 'Your password has been changed',
        text: 'Hello,\n\n' +
          'This is a confirmation that the password for your account ' + user.email + ' has just been changed.\n'
      };
      smtpTransport.sendMail(mailOptions, function(err) {
        req.flash('success', 'Success! Your password has been changed.');
        done(err);
      });
    }
  ], function(err) {
    res.redirect('/artworks');
  });
}); 













////users profile
router.get("/users/:id",function(req,res){
	 User.findById(req.params.id,function(err,foundUser){
		 if(err)
			 {
				 req.flash("error","Something went wrong!");
				 res.redirect("/");
			 }
		 
		 artwork.find().where('author.id').equals(foundUser._id).exec(function(err,artworks){
			 if(err)
				 {
					 req.flash("error","Something went wrong!");
					 res.redirect("/");
				 }
			 		 res.render("users/show",{user: foundUser,artworks: artworks});
		 });
	 });
});




module.exports = router;