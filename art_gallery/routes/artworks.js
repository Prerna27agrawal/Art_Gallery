var express= require("express");
var router= express.Router();
var artwork = require("../models/artworks");
var Comment= require("../models/comment");
var middleware = require("../middleware/index.js");

var multer = require('multer');
var storage = multer.diskStorage({
	  filename: function(req, file, callback) {
    callback(null, Date.now() + file.originalname);
  }
});
var imageFilter = function (req, file, cb) {
    // accept image files only
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
        return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
};
var upload = multer({ storage: storage, fileFilter: imageFilter})

var cloudinary = require('cloudinary');
cloudinary.config({ 
  cloud_name: 'dhr7wlz2k', 
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});


//Index route-show all artworks
//CREATE-add new artwork to DB
router.get("/artworks",function(req,res)
{
	
	var perPage = 4;
	var pageQuery = parseInt(req.query.page);
	var pageNumber = pageQuery ? pageQuery:1;
	//console.log(req.user);
	////get all artworks from DB and then render that file
	//we can delete the array we hard coded before
	/*artwork.find({}, function(err,allartworks)
				   {
		if(err)
			console.log(err);
		else
			res.render("artworks/index",{artworks:allartworks, page: "artworks"});
	});*/
	 artwork.find({}).skip((perPage * pageNumber) - perPage).limit(perPage).exec(function (err, allartworks) {
        artwork.count().exec(function (err, count) {
            if (err) {
                console.log(err);
            } else {
                res.render("artworks/index", {
                    artworks: allartworks,
                    current: pageNumber,
                    page: Math.ceil(count / perPage)
                });
            }
        });
    });
	
});


//create a artwork and save to db
router.post("/artworks", middleware.isLoggedIn, upload.single('image'), function(req, res) 
		{
	 cloudinary.v2.uploader.upload(req.file.path, function(err,result) {
		 if(err)
			 {
				 req.flash("error",err.message);
				 return res.redirect('back');
			 }
  // add cloudinary url for the image to the artwork object under image property
  req.body.artwork.image = result.secure_url;
//add image public_id to artwork object
		 req.body.artwork.imageId = result.public_id;
  // add author to artwork
  req.body.artwork.author = {
    id: req.user._id,
    username: req.user.username,
	  firstName: req.user.firstName
  }
  artwork.create(req.body.artwork, function(err, artwork) {
    if (err) {
      req.flash('error', err.message);
      return res.redirect('back');
    }
    res.redirect('/artworks/' + artwork.id);
  });
});
});


//New -show form to create new artwork 
router.get("/artworks/new",middleware.isLoggedIn,function(req,res)
	   {
	        res.render("artworks/new");
});


//SHOW - shows more inf about one artwork
router.get("/artworks/:id", function(req,res){
	//find the artworks with provided ID
	//new method given by mongoose findbyid()
	artwork.findById(req.params.id).populate("comments").exec(function(err,foundartwork){
		if(err)
			console.log(err);
		else
			{
				 console.log(foundartwork);
			  //render show template with that artwork
	          res.render("artworks/show",{artwork: foundartwork});
			}
	});
});


//========
//EDIT artwork
//============
//edit artwork router
router.get("/artworks/:id/edit",middleware.checkartworkOwnership,function(req,res){
	//if user logged in or not
     artwork.findById(req.params.id,function(err,foundartwork){          			 res.render("artworks/edit",{artwork: foundartwork}); 
	 });
});
	


//update artwork route
/*router.put("/artworks/:id",middleware.checkartworkOwnership,upload.single('image'),function(req,res){
	//find and update the correct artwork
	if(req.file)
		{
			cloudinary.v2.uploader.upload(req.file.path,function(result){
				
			})
		}
		artwork.findByIdAndUpdate(req.params.id,req.body.artwork,function(err,upgradedartwork){
		if(err){
			res.redirect("/artworks");
		}
		else{
			req.flash("success","artwork updated");
			//redirect somewhere(show page)
			res.redirect("/artworks/"+req.params.id);
		}
	});
	
});
*/
//////////////NEW way to update artwork considering the image also



router.put("/artworks/:id",middleware.checkartworkOwnership, upload.single('image'), function(req, res){
    artwork.findById(req.params.id, async function(err, artwork){
        if(err){
            req.flash("error", err.message);
            res.redirect("back");
        } else {
            if (req.file) {
              try {
                  await cloudinary.v2.uploader.destroy(artwork.imageId);
                  var result = await cloudinary.v2.uploader.upload(req.file.path);
                  artwork.imageId = result.public_id;
                  artwork.image = result.secure_url;
              } catch(err) {
                  req.flash("error", err.message);
                  return res.redirect("back");
              }
            }
            artwork.name = req.body.name;
            artwork.description = req.body.description;
            artwork.save();
            req.flash("success","Successfully Updated!");
            res.redirect("/artworks/" + artwork._id);
        }
    });
});






//+==============
//DELETE artwork
//==========
//Destroy artwork route
/*router.delete("/artworks/:id",middleware.checkartworkOwnership,function(req,res){
	artwork.findByIdAndRemove(req.params.id,function(err){
		if(err){
			res.redirect("/artworks");
		}
		else{
			req.flash("success","artwork deleted");
			res.redirect("/artworks");
		}
	})
});*/

router.delete("/artworks/:id",middleware.checkartworkOwnership,function(req,res){
 artwork.findById(req.params.id, async function(err, artwork) {
if(err)
	{
		req.flash("error", err.message);
          return res.redirect("back");
	}
	 try{
		 await
		 cloudinary.v2.uploader.destroy(artwork.imageId);
		  artwork.remove();
        req.flash('success', 'artwork deleted successfully!');
        res.redirect('/artworks');
    } catch(err) {
        if(err) {
          req.flash("error", err.message);
          return res.redirect("back");
        }
    }
  });
});





module.exports = router;