//////LINK FOR SLIDE SHOW ADDED TO LANDING PAGE
///https://github.com/nax3t/background-slider
/////app.js


//for keeping the cloud api secret
//https://www.npmjs.com/package/dotenv
require('dotenv').config()
////
var express    = require("express");
var app        = express();
var bodyParser = require("body-parser");
var mongoose   = require("mongoose");
var passport   = require("passport");
var LocalStrategy= require("passport-local");
var methodOverride = require("method-override");
var flash          =require("connect-flash");
//var moment = require("moment");

var artwork= require("./models/artworks");
var Comment = require("./models/comment");
var User = require("./models/user");

var commentRoutes = require("./routes/comments");
var artworkRoutes=require("./routes/artworks");
var indexRoutes = require("./routes/index");


mongoose.connect("mongodb://localhost/art_gallery", { useNewUrlParser: true ,useUnifiedTopology: true});
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);
//either memorise the next line or copy paste it
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine","ejs");
//to add  the stylesheet to app.js
//__dirname -gives the whole path of v3 directory
app.use(express.static(__dirname+"/public"));
app.use(methodOverride("_method"));
app.use(flash());
//Now moment is available for use in all of your view files via the variable named moment
app.locals.moment= require("moment");


//seedDB();//seed the database

//PASSPORT CONFIGURATION
app.use(require("express-session")({
	 secret: "Once again Rusty wins cutest dog",
	resave :false,
	saveUninitialized: false	
		}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
//so that current user data is avialable to every route
app.use(function(req,res,next){
	res.locals.currentUser = req.user;
	res.locals.error = req.flash("error");
		res.locals.success = req.flash("success");
	next();
});

app.use(indexRoutes);
app.use(artworkRoutes);
app.use(commentRoutes);


app.listen(3000,function()
		  {
	console.log("ArtGallery has started");
});

