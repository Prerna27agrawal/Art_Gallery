var mongoose   = require("mongoose");

mongoose.connect("mongodb://localhost/art_gallery", { useNewUrlParser: true ,useUnifiedTopology: true});
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);


//SCHEMA SETUP
var artworkschema = new mongoose.Schema({
	name: String,
	//price: String,
	image: String,
	imageId : String,
	description: String,
	createdAt: {type: Date,default: Date.now},
	author: {
		id:{
			//for the user currently signed in and construct the artwork 
			type: mongoose.Schema.Types.ObjectId,
			ref: "User"
		},
		username : String,
		firstName :String,
	},
	comments:[
		{
			//for user currently signed in
			type: mongoose.Schema.Types.ObjectId,
			ref: "Comment"
		}
	]
});

module.exports = mongoose.model("artwork", artworkschema);