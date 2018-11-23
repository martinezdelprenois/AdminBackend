var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var CancelOrderSchema = new Schema({

    product:[{type:String}],
    prices:[{type: String}],
    qty:[{type:Array}],
    total: {type:Number},
    reason: {type:String},
    user:{type: Schema.Types.ObjectId, ref: 'users'},
	date: { type: Date, default: Date.now },
});


module.exports = mongoose.model('cancelledorders', CancelOrderSchema);