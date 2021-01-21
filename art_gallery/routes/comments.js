var express= require("express");
var router= express.Router();
var artwork = require("../models/artworks");
var Comment= require("../models/comment");
var middleware = require("../middleware/index.js");

//==================
//COMMENTS ROUTES
//=======================
router.get("/artworks/:id/comments/new",middleware.isLoggedIn,function(req,res){
	//find artworks by id
	artwork.findById(req.params.id,function(err,artwork){
		if(err)
			console.log(err);
		else{
			res.render("comments/new",{artwork: artwork});
		}
	});
});

//comment create
router.post("/artworks/:id/comments",middleware.isLoggedIn,function(req,res){
	//lookup artwork using id
	artwork.findById(req.params.id,function(err,artwork){
		if(err)
		{
			console.log(err);
			res.redirect("/artworks");
		}
		else{
			Comment.create(req.body.comment,function(err,comment){
				if(err)
					{
						req.flash("error","Something went wrong");
					console.log(err);
					}
				else
					{
						//add username and id to comment
						comment.author.id = req.user._id;
						comment.author.username =req.user.username;
						//save comment
						comment.save();
						artwork.comments.push(comment);
						artwork.save();
						req.flash("success","Successfully added comment");
						res.redirect('/artworks/'+artwork._id);
					}
			});
		}
	});
});


//COMMENT edit comments
router.get("/artworks/:id/comments/:comment_id/edit",middleware.checkCommentOwnership,function(req,res){
	Comment.findById(req.params.comment_id,function(err,foundComment){
		if(err)
			{
			res.redirect("back");
			console.log(err);
			}
		else
			{
				 res.render("comments/edit",{artwork_id: req.params.id , comment: foundComment}); 
			}
	});
	
}); 

//COMMENT UPDATEq
router.put("/artworks/:id/comments/:comment_id", middleware.checkCommentOwnership,function(req,res){
	Comment.findByIdAndUpdate(req.params.comment_id,req.body.comment,function(err,updatedComment){
		if(err)
			{
				//console.log(err);
				res.redirect("back");
			}
		else{
			//req.params.id gives the id of current artwork and req.cparams.comment_id gives id of current comment
			res.redirect("/artworks/"+ req.params.id);
		}
	});
});


//COMMENT DESTROY ROUTESroue
router.delete("/artworks/:id/comments/:comment_id",middleware.checkCommentOwnership,function(req,res){
	//findByIdAndRemove
	Comment.findByIdAndRemove(req.params.comment_id,function(err){
		if(err)
			{
				res.redirect("back");
			}
		else{
			req.flash("success","Comment deleted");
			res.redirect("/artworks/"+req.params.id);
		}
	});
	
});





module.exports = router;