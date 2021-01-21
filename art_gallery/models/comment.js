var mongoose   = require("mongoose");

mongoose.connect("mongodb://localhost/art_gallery", { useNewUrlParser: true ,useUnifiedTopology: true});
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);

var commentSchema=mongoose.Schema({
	text: String,
	createdAt: {type:Date, default:Date.now},
	author:{
		id:
		{
			type: mongoose.Schema.Types.ObjectId,
			ref: "Uer"
		},
		username: String
	
	}
});

module.exports=mongoose.model("Comment",commentSchema);