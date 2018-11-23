var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var OrderSchema = new Schema({

    product:[{type:String}],
    prices:[{type: String}],
    qty:[{type:Array}],
    total: {type:Number},
    user:{type: Schema.Types.ObjectId, ref: 'users'},
	date: { type: Date, default: Date.now },
});


module.exports = mongoose.model('orders', OrderSchema);