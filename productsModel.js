var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var ProductsSchema = new Schema({

        product: {type:String},
        price: {type: Number},
        category:{type: Schema.Types.ObjectId, ref: 'category'},
        filename:String,
        originalname: String,
        imgURL: String,
        pricy: {type: Number, default:0},
   
	date: { type: Date, default: Date.now },
});


module.exports = mongoose.model('products', ProductsSchema);