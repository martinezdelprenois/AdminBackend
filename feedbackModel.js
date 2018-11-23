var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var FeedBackSchema = new Schema({



    user: {type: Schema.Types.ObjectId, ref :'users'},
    message: String,
	date: { type: Date, default: Date.now },
});


module.exports = mongoose.model('feedback', FeedBackSchema);