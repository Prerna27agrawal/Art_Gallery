var mongoose   = require("mongoose");

var passportLocalMongoose = require("passport-local-mongoose");
mongoose.connect("mongodb://localhost/art_gallery", { useNewUrlParser: true ,useUnifiedTopology: true});
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);

var UserSchema = new mongoose.Schema({
	username: {type:String,required:true},
	password: {type:String},//String,
	firstName:{type:String, required:true},//String,
	lastName:String,
	email:{ type:String,unique:true,required:true},
	//requireed for password reset
	resetPasswordToken:String,
	resetPasswordExpires: Date,
	isAdmin :{type: Boolean,default: false}
	
});

UserSchema.plugin(passportLocalMongoose);
module.exports = mongoose.model("User",UserSchema);