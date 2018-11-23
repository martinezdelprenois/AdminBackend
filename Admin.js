var mongoose = require('mongoose');
var bcrypt = require('bcrypt');
var Schema = mongoose.Schema;

var AdminSchema = new Schema({

   
    username: {
        type:String,
        required:true,
        unique: true
    },


		password: {
		type:String,
		required :true,
	},

	date: { type: Date, default: Date.now },
});

// store user's hashed password
AdminSchema.pre('save', function(next){


var user = this;
if(this.isModified('password') || this.isNew){
bcrypt.genSalt(10, function(err, salt) {

if(err){
return next(err); 
}

bcrypt.hash(user.password, salt, function(err,hash){
if(err){
	return next(err);
}
user.password = hash;
next();

});

});


}

else {

	return next();
}

});

//method to compare the password
AdminSchema.methods.comparePassword = function(pw, cb){

	 bcrypt.compare(pw, this.password, function(err, isMatch){
if(err){
	return cb(err);
}

cb(null, isMatch);
	 });
};
module.exports = mongoose.model('Admin', AdminSchema);