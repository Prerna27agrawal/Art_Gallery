//all the middle ware goes here
var artwork = require("../models/artworks");
var Comment = require("../models/comment");
var middlewareObj ={};
middlewareObj.checkartworkOwnership= function(req,res,next){
	//if user logged in or not
	if(req.isAuthenticated()){
			
     artwork.findById(req.params.id,function(err,foundartwork){
		 if(err){
			 req.flash("error","artwork not found ");
			 res.redirect("back");
		 }
		 else
			 {
				  //does user own the artworks?
				 if(foundartwork.author.id.equals(req.user._id) || req.user.isAdmin){
					 return next();
					 //next is used because same middleware we afe using in delte so we always dont want to go back on edit
					 //res.render("artworks/edit",{artwork: foundartwork});
				 }
				 else{
					  //redirect
					 req.flash("error","You don't have permission to do that");
					 res.redirect("back");
				 }
				 
			 }
	 });
	}
	else{
		//if not redirect
		req.flash("error","You need to be logged in!");
		res.redirect("/login");
		
	}
}

//middleware
middlewareObj.checkCommentOwnership = function(req,res,next){
	//if user logged in or not
	if(req.isAuthenticated()){
			
     Comment.findById(req.params.comment_id,function(err,foundComment){
		 if(err){
			 req.flash("error","You don't have permission to do that");
			 res.redirect("back");
		 }
		 else
			 {
				  //does user own the artworks?
				 if(foundComment.author.id.equals(req.user._id)|| req.user.isAdmin){
					  next();
					 //next is used because same middleware we afe using in delte so we always dont want to go back on edit
					 //res.render("artworks/edit",{artwork: foundartwork});
				 }
				 else{
					  //redirect
					 res.redirect("back");
				 }
				 
			 }
	 });
	}
	else{
		req.flash("error","You need to be logged in!");
		//if not redirect
		res.redirect("/login");
		
	}
} 



//middleware
middlewareObj.isLoggedIn  =function(req,res,next){
	if(req.isAuthenticated()){
		return next();
	}
	//sucess for green error for red
	req.flash("error","You need to be logged in!");
	res.redirect("/login");
}

//middleware




module.exports = middlewareObj;