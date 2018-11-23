
var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var port = 7000;
var jwt = require('jsonwebtoken');
var secretkey = 'bobs3@dfljsdfsdjfk23432dsf@fdskfsdlfklsk4345lfldkflkdjfldkjfjsdlfjlsdjflsknvneekelllelklvksvlksflskdflksflksflskflskksflsdcat';

//var db = 'mongodb://localhost:27017/butcher';
 var db = 'mongodb://Admin:12345@127.0.0.1:27017/butcher';


var FeedBack = require('./feedbackModel');
var User = require('./usersModel');
var Admin = require('./Admin');
var Product = require('./productsModel');
var Category = require('./categoryModel');
var Promotion = require('./promotionsModel');
var Cancelled = require('./cancelOrderModel');
var Delivered = require('./deliveredOrders');
var Pending = require('./orderModel');
var Hams = require('./hampersModel');

var cors = require('cors');
var methodOverride = require('method-override');
var morgan = require('morgan');
var fs = require('fs-extra');
var multer = require('multer');
var path = require('path');
var timestamp = new Date().getTime().toString();




mongoose.Promise = global.Promise; 
mongoose.connect(db, { useMongoClient: true });

// dealing with the connection just right below 
var dbs = mongoose.connection;
 dbs.on('error', console.error.bind(console, 'connection error:'));
 dbs.once('open', function(){
 	console.log('successfully connected');
 });
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));
app.use(morgan('dev'));
app.use(methodOverride());
app.use(cors());
app.use(function(req, res, next) {
   res.header("Access-Control-Allow-Origin", "*");
   res.header('Access-Control-Expose-Headers', 'X-Requested-With,content-type, Authorization, access_token');
   res.header('Access-Control-Allow-Methods', 'DELETE, PUT, POST, GET');
   res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");

   next();
});







app.get('/', (req,res)=>{
	res.send('happy buying meat guys');
});

// REGISTER NEW ADMIN BELOW
app.post('/api/register', (req,res)=>{

    var newAdmin = new Admin();
     newAdmin.username = req.body.username;
     newAdmin.password = req.body.password;

     newAdmin.save((err,saved)=>{
         if(err){
             res.json({
                 message: 'could not register'
             })
         } else {
             console.log(saved._id);

        ID = saved._id;

        jwt.sign({ID}, secretkey, {expiresIn: '1h'}, (err,success)=>{
            if(err){
                res.json({
                    message: 'couldnot save'
                })
            } else {
                res.json({
                    success: true,
                toks: success
                });
            }
        });
         }
     });


});


// LOGIN ADMIN BELOW
app.post('/api/login', (req,res)=>{

    var usernames = req.body.username;

    Admin.findOne({username:usernames}, (err,successful)=>{
        if(err){

            console.log(err);
            res.json({
                login:false,
                message: 'this username doesnot exist'
            })
        } else if(!successful){

            res.json({
                login:false,
                message: 'this username doesnot exist'
            })

            console.log('nope');
        } else {
            successful.comparePassword(req.body.password, function(err, isMatch){
			
				if(isMatch && !err){
					var id = successful._id;
					jwt.sign({id}, secretkey, (err,token)=>{
						if(err){
							res.json({
                                login:false
                            })
						} else {
							res.json({
								login: true,
								SentToken: token,
								

							});
						}
					});
				} else if(!isMatch){
					res.json({
						login: false,
						message: 'passsword does not match'
					});
				}
			});
        }
    })


});

app.get('/api/users', (req,res)=>{
    User.find({}, '-__v -password').sort({joined:1}).lean().exec((err,suc)=>{
        if(err){
            res.json({
                error: true,
                message: 'could not fetch data'
            });
        } else {
            User.find({}).count((err,counted)=>{
                if(err){
                    res.json({

                        getting:false
                    })
                } else {

                    res.json({
                        getting:true,
                        query: suc,
                    count: counted
                    })
                    
                }
            })

        }
    });
});

// SETTING UP THE PRODUCT IMAGES
var UPLOAD_PATH_PRODUCT_IMG = '../../_FOOD_PHOTOS';
var photoMeat = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, UPLOAD_PATH_PRODUCT_IMG);
    },
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now());
    }
});

 var uploadMeatPhoto = multer({ storage: photoMeat });


// ADDING THE PRODUCTS BELOW
app.post('/api/addProduct', uploadMeatPhoto.single('dp'), (req,res)=>{

    var addProduct = new Product();

    addProduct.product = req.body.product;
    addProduct.price = req.body.price;
    addProduct.filename = req.file.filename;
    addProduct.originalname = req.file.originalname;

    addProduct.save((err,saved)=>{
        if(err){
            res.json({
                message: 'couldnot add new product',
                added: false

            })
        } else {
            var ID = saved._id;
            updateURL = {
                $set: {imgURL:req.protocol + '://' + req.get('host') + '/api/Product/' + ID }
            };

    Product.findByIdAndUpdate({_id: ID}, updateURL, {new:true}, (err,success)=>{
        if(err){
            res.json({
                added:false
            })
        } else {
            var categoryName = req.body.category;
            Category.findOne({category:categoryName}, (err,found)=>{
                if(err){
                    res.json({
                        added:false
                    })
                } else  if(found){

                        var addCategory = new Category();
                      
                        update = {
                            $push:{products: ID}
                                                            };
                            
          Category.findOneAndUpdate({category: req.body.category},update,{new:true},
                        (err,success)=>{
                                     if(err){
                                   res.json({
                                      added:false
                                               })
                                        } else {
                                          res.json({
                                              added:true,
                                                        
                                              })
                                                    }
                            
                                            })
                    }

                  
                
            });
        }
    });
        }
    });
           
            

});

// GETTING THE PRODUCT IMAGE BELOW
app.get('/api/Product/:id', (req, res, next) => {
    let imgId = req.params.id;
 
    Product.findById(imgId, (err, image) => {
        if (err) {
            console.log(err);
        }
        // stream the image back by loading the file
        res.setHeader('Content-Type', 'image/jpeg');
        
 fs.createReadStream(path.join(UPLOAD_PATH_PRODUCT_IMG, image.filename))
 .pipe(res);
    });
});

//UPDATING THE PRODUCT
app.put('/api/updateProduct/:id', (req,res)=>{
    

     var ID = req.params.id;

    if(req.body.newproduct !== undefined && req.body.newprice === undefined){

        updating = {

            $set: {product : req.body.newproduct}
        };
        Product.findByIdAndUpdate({_id:ID}, updating, {new:true}, (err,suc)=>{

            if(err){
                res.json({
                    updated: false
                });
            } else if (suc){
                res.json({
                    updated: true
                });
            }
        });

       
    } else if (req.body.newproduct === undefined && req.body.newprice !== undefined) {
        updating = {

            $set: {price : req.body.newprice}
        };
        Product.findByIdAndUpdate({_id:ID}, updating, {new:true}, (err,suc)=>{

            if(err){
                res.json({
                    updated: false
                });
            } else if (suc){
                res.json({
                    updated: true
                });
            }
        });
    } else if (req.body.newproduct !== undefined && req.body.newprice !== undefined){
        updating = {

            $set: {price : req.body.newprice, product: req.body.newproduct}
        };
        Product.findByIdAndUpdate({_id:ID}, updating, {new:true}, (err,suc)=>{

            if(err){
                res.json({
                    updated: false
                });
            } else if (suc){
                res.json({
                    updated: true
                });
            }
        });
    }
});

// DELETE THE PRODUCT
app.delete('/api/deleteProduct/:id', (req,res)=>{
    console.log(req.params.id);

    var ID = req.params.id;

    Product.findByIdAndRemove({_id:ID}, (err,suc)=>{
        if(err){
            res.json({
                deleting : false
            });
        } else if (suc) {
            res.json({
                deleting : true
            });
        }
    });
});

// GETTING THE PRODUCT CATEGORIES BELOW
app.get('/api/getCategories', (req,res)=>{
    Category.find({},'-__v -products -_id -date').lean().exec( (err,found)=>{
        if(err){
            res.json({
                finding:false
            });
        } else {
            res.json({
                finding: true,
                data: found
            });
        }
    });
});

// GET THE PRODUCTS
app.get('/api/getProducts', (req,res)=>{
    Category.find({}).populate('products', '-__v').lean().exec( (err,found)=>{
        if(err){
            res.json({
                finding:false
            });
        } else {
            res.json({
                finding: true,
                data: found
            });
        }
    });
});

// UPLOAD THE CATEGORY
app.post('/api/newCategory',uploadMeatPhoto.single('dp'), (req,res)=>{

    var catNew = new Category();

    catNew.category = req.body.catName;
    catNew.originalname = req.file.originalname;
    catNew.filename = req.file.filename;

    catNew.save((err,saved)=>{
        if(err){
            res.json({
                saved:false
            });
        } else if(saved) {

            var ID = saved._id;
            updateImg = {
                $set : {imgCat:req.protocol + '://' + req.get('host') + '/api/category/' + ID }
            };

            Category.findByIdAndUpdate({_id:ID}, updateImg, {new:true}, (err,suc)=>{

                if(err){
                    res.json({
                        saved: false
                    });
                } else {
                    res.json({
                        saved:true
                    });
                }
            } );
        }
    });
});

// GET THE PICS FOR THE CATEGORIES
app.get('/api/category/:id', (req, res) => {
    let imgId = req.params.id;
 
    Category.findById(imgId, (err, image) => {
        if (err) {
            console.log(err);
        }
        // stream the image back by loading the file
        res.setHeader('Content-Type', 'image/jpeg');
        
 fs.createReadStream(path.join(UPLOAD_PATH_PRODUCT_IMG, image.filename))
 .pipe(res);
    });
});

// GET THE CATEGORIES
app.get('/api/getallcategories', (req,res)=>{

    Category.find((err,found)=>{
        if(err){
            res.json({
                finding:false
            })
        } else {

            console.log(found);
            res.json({
                finding: true,
                found: found
            })
        }
    })

})

// GET FEEDBACK
app.get('/api/feedback', (req,res)=>{

    console.log('hit here');
    FeedBack.find({}).populate('user', '-__v -password -joined').sort({'date':-1}).lean().exec((err,found)=>{
        if(err){
            res.json({
                finding: false
            });
        } else {

            console.log(found);
            res.json({
                finding: true,
                feed: found
            });
        }
    });
});

// ADD NEW PROMOTION BELOW
app.post('/api/newPromotion', uploadMeatPhoto.single('dp'), (req,res)=>{


    var newPromo = new Promotion();
    newPromo.name = req.body.Name;
    newPromo.filename = req.file.filename;
    newPromo.originalname = req.file.originalname;

    newPromo.save((err,saved)=>{
        if(err){
            res.json({
                saving:false
            })
        } else if (saved) {

            var ID = saved._id;

            updating ={
                $set: {imgURL :req.protocol + '://' + req.get('host') + '/api/promotion/' + ID }
            }

            Promotion.findByIdAndUpdate({_id:ID}, updating, {new:true}, (err,updated)=>{
                if(err){
                    res.json({
                        saving: false
                    })
                } else if (updated){
                    res.json({
                        saving: true
                    })
                }
            })
        }
    })

});

// GET THE PROMOTIONS
app.get('/api/getPromotions', (req,res)=>{

    Promotion.find({}, (err,found)=>{
        if(err){
            res.json({
                finding: false
            })
        } else if (found) {

            console.log(found);
            res.json({

            finding: true,
            promotions:found
            })
        }
    })
})


// SHOW THE PROMOTION IMAGES
app.get('/api/promotion/:id', (req, res) => {
    let imgId = req.params.id;
 
    Promotion.findById(imgId, (err, image) => {
        if (err) {
            console.log(err);
        }
        // stream the image back by loading the file
        res.setHeader('Content-Type', 'image/jpeg');
        
 fs.createReadStream(path.join(UPLOAD_PATH_PRODUCT_IMG, image.filename))
 .pipe(res);
    });
});

// DELETE A PROMOTION
app.delete('/api/deletePromo/:id', (req,res) => 
{
    var ID = req.params.id;

    Promotion.findOneAndRemove({_id:ID}, (err,suc)=>{
        if(err){
            res.json({
                del:false
            })
        } else if (suc){
            res.json({
                del:true
            })
        }
    })
    console.log(req.params.id);

});


//UPDATING THE CATEGORY
app.put('/api/updateCategory/:id', (req,res)=>{


    var ID = req.params.id;


Category.findById({_id: ID}, (err,found)=>{

    if(err){
        res.json({
            updating : false
        })
    } else if (found) {

        var newThing = {
            $set : {category : req.body.newcating}
        }

        Category.findByIdAndUpdate({_id: ID}, newThing, {new:true}, (err,updatings)=>{
            if(err){
                res.json({
                    updating : false
                })
            } else if (updatings) {

                res.json({
                    updating : true
                })
            }
        })
    }
})



});

// DELETING A CATEGORY
app.delete('/api/deleteCategory/:id', (req,res)=>{

    var ID = req.params.id;
    Category.findByIdAndRemove({_id: ID}, (err,suc) =>{
        if(err){
            res.json({
                deleting : false
            })
        } else if(suc) {

            res.json({
                deleting : true
            })
        }
    })
});


// GET THE CANCELLED ORDER
app.get('/api/getCancelledOrders', (req,res)=>{

    Cancelled.find({}).populate('user', '-__v -password -joined').sort({'date':-1}).lean().exec((err,found)=>{
        if(err){
            res.json({
                finding: false
            });
        } else {

            res.json({
                finding: true,
                feed: found
            });
        }
    });
});

// GETTING THE DELIVERED ORDERS
app.get('/api/getdeliveredorders', (req,res)=>{

    Delivered.find({}).populate('user', '-__v -password -joined').sort({'date':-1}).lean().exec((err,found)=>{
        if(err){
            res.json({
                finding: false
            });
        } else {

            res.json({
                finding: true,
                dats: found
            });
        }
    });
});

// GET THE PENDING ORDERS
app.get('/api/getpendingorders', (req,res)=>{
    Pending.find({}).populate('user', '-__v -password -joined').sort({'date':-1}).lean().exec((err,found)=>{
        if(err){
            res.json({
                finding: false
            });
        } else {

            res.json({
                finding: true,
                dats: found
            });
        }
    });
});

// ADD THE HAMPER ROUTE BELOW
app.post('/api/addHamper', uploadMeatPhoto.single('dp'),(req,res)=>{

    var newHamp = new Hams();

    newHamp.name = req.body.name;
    newHamp.filename = req.file.filename;
    newHamp.originalname = req.file.originalname;
    newHamp.price = req.body.price;

    newHamp.save((err,saved)=>{
        if(err){
            res.json({
                saved: false
            })
        } else if (saved) {
            var ID = saved._id;

            updating ={
                $set: {imgHamper:req.protocol + '://' + req.get('host') + '/api/hampers/'
                 + ID }
            };
            Hams.findByIdAndUpdate({_id:ID}, updating, {new:true},(err,suc)=>{
                if(err){
                res.json({
                    saved: false

                })
                } else if (suc) {
                    res.json({
                        saved: true
                    })
                }
            } );
        }
    });

});

// get the hamper packages below
app.get('/api/getHampers', (req,res)=>{

    Hams.find({},(err,found)=>{
        if(err){
            res.json({
                finding: false
            })
        } else if (found){
            res.json({
                finding : true,
                data: found
            })
        }
    })

});

// GET THE HAMPER IMAGES BELOW
app.get('/api/hampers/:id', (req, res) => {
    let imgId = req.params.id;
 
    Hams.findById(imgId, (err, image) => {
        if (err) {
            console.log(err);
        }
        // stream the image back by loading the file
        res.setHeader('Content-Type', 'image/jpeg');
        
 fs.createReadStream(path.join(UPLOAD_PATH_PRODUCT_IMG, image.filename))
 .pipe(res);
    });
});

// UPDATING THE HAMPERS BELOW]
app.put('/api/updatehamper/:id', (req,res)=>{

    var ID = req.params.id;


    Hams.findById({_id: ID}, (err,found)=>{
    
        if(err){
            res.json({
                updating : false
            })
        } else if (found) {
    
            var newThing = {
                $set : {price : req.body.newPrice}
            }
    
            Hams.findByIdAndUpdate({_id: ID}, newThing, {new:true}, (err,updatings)=>{
                if(err){
                    res.json({
                        updating : false
                    })
                } else if (updatings) {
    
                    res.json({
                        updating : true
                    })
                }
            })
        }
    });
});

app.delete('/api/deleteHamper/:id', (req,res)=>{

    var ID = req.params.id;
    Hams.findByIdAndRemove({_id: ID}, (err,suc) =>{
        if(err){
            res.json({
                deleting : false
            })
        } else if(suc) {

            res.json({
                deleting : true
            })
        }
    })
});

//APP LISTENING TO PORT
app.listen(port,function(){
	console.log('app listening on port' + port);
});