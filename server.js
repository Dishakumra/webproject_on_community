var express = require('express')
var path = require('path')
var app = express()
var session = require('express-session');
var ejs = require('ejs')
var multer=require('multer')

var fs = require('fs')
var nodemailer = require('nodemailer')
console.log(process.versions)

//Acces static files
app.use(express.static(path.join(__dirname, 'public1')));

//Bodyparser
app.use(express.urlencoded({extended: true}));
app.use(express.json());
app.use(session({secret: "SecretLogin"}));
app.set('view engine', 'ejs');

//Connect with db
var mongoose = require('mongoose');
var mongodb     = require('mongodb');
var MongoClient = mongodb.MongoClient;
var mongoDB = 'mongodb://localhost/myDB';

mongoose.connect(mongoDB);

mongoose.connection.on('error', (err) => {
    console.log('DB connection Error');
});

mongoose.connection.on('connected', (err) => {
    console.log('DB connected');
});
mongoose.set('useFindAndModify', false);
var productSchema = new mongoose.Schema({
    user: String,
    password:String,
    email:String,
    phno:Number,
    dob:String,
    city:String,
    gender:String,
    roll:String,
    status:String,
    active:Number,
    photopath:String,
    commsin:Array,
    commsreq:Array,
    commsadmin:Array

  })
  var product =  mongoose.model('users', productSchema);





  var TagSchema = new mongoose.Schema({
      Name:String,
      By:String,
  	Date:String
    })

  var tag=  mongoose.model('tags', TagSchema);

  var communitySchema=new mongoose.Schema({
      Name:String,
      Status:String,
      Owner:String,
      Rule:String,
      Date:String,
      Location:String,
      Description:String,
      Requested:[String],
      Members:[String],
      final : {
        contentType: String,
       path : String
       }
  })
  var community=mongoose.model('comms',communitySchema);






  // Add in db
  var storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, './public1/myupload')
    },
    filename: function (req, file, cb) {
      cb(null, req.session.email +path.extname(file.originalname));
    }
  })

  var upload = multer({ storage: storage });
  app.use(express.static("./public1"));

app.post('/upload',upload.single('profilepic'),(req,res) =>{
    console.log("dddd");

    upload(req,res,(error)=>{
      if(error){
        res.render('edit-profile',{
          message:error,
          user:req.session
        })
      }
      else{
        console.log("ff");
        ;
          req.session.photopath=`myupload/${req.file.filename}`;
        res.render("edit-profile",{
          message:"succesfully uploaded....",
          filename:`myupload/${req.file.filename}`

        })
      }
    })
  })
  app.get('/comminfo/:id',function(req,res){
  	community.find({
  		_id:req.params.id
  	})
  	.then(data => {
            res.send(data)
          })
      .catch(err => {
            console.error(err)
            res.send(error)
          })
  })
  app.get('/findById/:id',function(req,res){
  	product.find({
  		_id:req.params.id
  	})
  	.then(data => {

            res.send(data)
            console.log("sss");
          })
          .catch(err => {
            res.send(error)
          })
  })
  app.get('/viewprofile/:id/:user',function(req,res){

  		res.render('viewprofile',{
  			userd:req.session
  		})


  })
  app.post('/findUser',function(req,res){
  	product.find({
  		email:req.body.email
  	})
  	.then(data => {
            res.send(data)
          })
      .catch(err => {
            console.error(err)
            res.send(error)
          })
  })
  app.get('/approverequest/:commid/:id',function(req,res){
  	community.findOneAndUpdate({
  		_id:req.params.commid
  	},{
  		$pull:{
  			Requested:req.params.id
  		},
  		$push:{
  			Members:req.params.id
  		}
  	},
  	 {
        new: true,                       // return updated doc
        runValidators: true              // validate before update
      })
      .then(data => {
          console.log(data)
  		product.findOneAndUpdate({
  			_id:req.params.id
  		},{
  			$push:{
  				commsin:req.params.commid
  			}
  		})
          res.redirect(`/managecommunity/${req.params.commid}/${req.session.ID}`
  		)
        })
        .catch(err => {
          console.error(err)
          res.send(error)
        })

  })
  app.get('/deleterequest/:commid/:id',function(req,res){
  	community.findOneAndUpdate({
  		_id:req.params.commid
  	},{
  		$pull:{
  			Requested:req.params.id
  		}
  	},
  	 {
        new: true,                       // return updated doc
        runValidators: true              // validate before update
      })
      .then(data => {
          console.log(data)
          res.redirect(`/managecommunity/${req.params.commid}/${req.session.ID}`,{userd:req.session})
        })
        .catch(err => {
          console.error(err)
          res.send(error)
        })

  })
  app.post('/updatecomm/:id',function(req,res){
  	console.log("AA");
      community.findOneAndUpdate(
      {
          _id:req.params.id  // search query
      },
          {
  			Name: req.body.commname,
        Status: req.body.status,
  			// field:values to update
      },
      {
        new: true,                       // return updated doc
        runValidators: true              // validate before update
      })
      .then(data => {
          console.log(data)
          res.redirect(`/listcomms/${req.session.ID}`)
        })
        .catch(err => {
          console.error(err)
          res.send(error)
        })
  })
  app.get('/login.html',function(req,res)
{
  res.render('login');
})
app.get('/home-inner',function(req,res)
{
  res.render('home-inner',{
    user:req.session
  });
})
  app.get('/1/:id' ,function(req,res){
    res.render('1',{
      userd:req.session
    });
  });
  app.get('/2/:id' ,function(req,res){
    res.render('2',{
      userd:req.session
    });
  });
  app.get('/commpanel/:id' ,function(req,res){
    res.render('commpanel',{
      userd:req.session
    });
  });
  app.get('/searchcomms/:id',(req,res)=>{

      res.render('searchcomm',{
  		userd:req.session
      })


  });
  app.post('/searchcommwithval/:id', function (req, res) {
   community.find({
     //   "Owner": {
     //     $ne: req.session.email
     //   },
     //   "Members": {
     //     $ne: req.session.ID
     //   },
     //   "Requested": {
     //     $ne: req.session.ID
     //   },
     // "Name":{
     //   $regex:req.body.value,
     //   $options:'i'
     // }
     })
     .then(data => {
       res.send(data);
     })
     .catch(err => {
       console.error(err)
       res.send(err);
     })
 })
 app.post('/comms/joined', function (req, res) {
   community.find({
       "Members": {
         $eq: req.session.ID
       },
       "Requested": {
         $ne: req.session.ID
       },
       "Owner": {
         $ne: req.session.email
       },
     }).sort({
       "Name": 1
     })
     .then(data => {
       // console.log("inside iampartof");
       // console.log(data);
       res.send(data);
     })
     .catch(err => {
       console.error(err)
       res.send(err);
     })
 });

 app.post('/comms/requested', function (req, res) {
   community.find({
       "Members": {
         $ne: req.session.ID
       },
       "Requested": {
         $eq: req.session.ID
       },
       "Owner": {
         $ne: req.session.email
       },
     }).sort({
       "Name": 1
     })
     .then(data => {
       // console.log("inside iampartof");
       // console.log(data);
       res.send(data);
     })
     .catch(err => {
       console.error(err)
       res.send(err);
     })
 });
 app.get('/getid',function(req,res)
{
  res.send({"id":req.session.ID})


})
  app.post('/searchcomm', function (req, res) {
   community.find({
       "Owner": {
         $ne: req.session.email
       },
       "Members": {
         $ne: req.session.ID
       },
       "Requested": {
         $ne: req.session.ID
       },
     }).sort({
       "user": 1
     })
     .then(data => {
       res.send(data);
     })
     .catch(err => {
       console.error(err)
       res.send(err);
     })
 });
  app.get('/communitylist/:id' ,function(req,res){
    res.render('communitylist',{
      userd:req.session
    });
  });
  app.get('/7/:id' ,function(req,res){
    res.render('7',{
      userd:req.session
    });
  });
  app.get('/commpanel' ,function(req,res){
    res.render('commpanel',{
      userd:req.session
    });
  });
  app.get('/comms/mycreated',function(req,res){
  	community.find({
  		Owner:req.session.email
  	})
  	.then(data => {
  		console.log(data)
            res.send(data)
          })
      .catch(err => {
            res.send(error)
          })
  })
  app.get('/managecommunity/:id/:user',function(req,res){

  		res.render('commprofile',{
  			userd:req.session
      })

  })
  app.get('/3/:id' ,function(req,res){
    res.render('3',{
      userd:req.session
    });
  });
  app.get('/11',(req,res)=>{
    res.render('edit-profile',{
      userd:req.session
    });
  })
  app.get('/edit-profile/:id' ,function(req,res){
    res.render('edit-profile');
  });
  app.get('/createtag/:id' ,function(req,res){
    res.render('createtag');
  });
  app.post('/data',(req,res)=>{
        console.log(req.body);
    var col=req.body.order[0].column;
    var dir=req.body.order[0].dir;
    var dataCol={
        0:"email",
      //  1:"phno",
        1:"city",
        2:"status",
        3:"roll",

    }
    var dataDir={
        "asc":1,
        "desc":-1
    }

    getdata(dataCol[col],dataDir[dir]);




function getdata(colname,sortorder)
{
    var numberOfUsers
     var x=product.count({},function(err,count){
         console.log('number of users :'+count);
         numberOfUsers=count;
     });
    var start=req.body.start;
    var length=req.body.length;
    var roll=req.body.roll;
    var status=req.body.status;
    var search=req.body.search.value;
    var findobj={};
    console.log(roll,status);
    console.log("***************");
    if(roll!="all")
       { findobj.roll=roll;}
    else{
        delete findobj["roll"];
    }
    if(status!="all")
        {findobj.status=status;}
    else{
        delete findobj["status"];
    }
       if(search!='')
        findobj["$or"]= [{
        "email":  { '$regex' : search, '$options' : 'i' }
    }, {
        "city": { '$regex' : search, '$options' : 'i' }
    },{
        "status":  { '$regex' : search, '$options' : 'i' }
    },{
        "roll": { '$regex' : search, '$options' : 'i' }
    }]
    else{
        delete findobj["$or"];
    }
    app.post('/deletetag',function(req,res){
    	tag.remove({
    		Name:req.body.Name
    	})
    		.then(data => {
              res.send('Deleted Successfully')
            })
        .catch(err => {
              console.error(err)
              res.send(error)
            })
    })

    console.log("000000000000000000000000000000000000");
    console.log(findobj);
    console.log("000000000000000000000000000000000000");
    var length2;
    product.find(findobj).then(data=>length2=data.length).catch(err=>console.log(err));
    product.find(findobj).skip(parseInt(start)).limit(parseInt(length)).sort({[colname] : sortorder})
    .then(data => {
      console.log(data);
      console.log("rtypoiuytrewoiuytreioiuytr_______________________________");
          res.send({
         "recordsTotal":String(numberOfUsers),
         "recordsFiltered":length2,
         "start":parseInt(start),
         "length":parseInt(length),data})
   })
   .catch(err => {
     console.error(err)
     res.send("error getting info ")
   });
}





});
app.get('/switchtouser/:id',(req,res)=>{

			req.session.touser=1;
    res.redirect(`/1/${req.session.ID}`)


})
app.get('/createcomm/',function(req,res){

    res.render('createcomm',{
		userd:req.session
    })

})
app.get('/switchtoadmin/:id',(req,res)=>{

			req.session.touser=0;
    res.redirect(`/1/${req.session.ID}`)


})
app.post('/community/joinrequest', function (req, res) {
  //console.log(req.body);
  community.find({
      "_id": req.body.id,
    })
    .then(data => {

      if (data[0].Rule == "Direct") {
        console.log("inside if");
		  community.findOneAndUpdate({
			  "_id":req.body.id
		  },
									 {
			  $push:{
				  Members:req.session.ID
			  }
		  }
		,{safe: true, upsert: true},
    function(err, doc) {
        if(err){
        console.log(err);
            res.send(err)
        }
			  else{
        //do stuff
            product.findOneAndUpdate({
			  "_id":req.session.ID
		  },{
			  $push:{
				  commin:req.body.id
			  }
			},{safe: true, upsert: true},
    function(err, doc) {
        if(err){
        console.log(err);
            res.send(err)
        }else{
        //do stuff
            res.redirect(`/commpanel/${req.session.ID}`);
        }
		  } )
        }
		   }

		)						 }
	  else if (data[0].Rule == "Permission") {
        console.log("inside request else\n");
		  community.findOneAndUpdate({
			  "_id":req.body.id
		  },{
			  $push:{
				  Requested:req.session.ID
			  }
		  },{safe: true, upsert: true},
    function(err, doc) {
        if(err){
        console.log(err);
            res.send(err)
        }else{

            res.redirect(`/commpanel/${req.session.ID}`);

        }
		  } )
      }
    })
    .catch(err => {
      console.error(err)
      res.send(err);
    })
});
app.get('/tags/:id',(req,res)=>{

    res.render('createtag',{
		userd:req.session
    })


})

app.get('/listtags/:id',(req,res)=>{

    res.render('taglist',{
		userd:req.session
    })


})
app.post('/getcommslist',function(req,res){




		var count;
		count = community.countDocuments({}, function (error, c) {
      count = c;
    });
		console.log(req.body)
		var findobj={};
		var querystatus=req.body.querypermission;
				var searchval=req.body.search.value;

		if(querystatus==0){
			community.find({}, {
        }).limit(parseInt(req.body.length)).skip(parseInt(req.body.start))
        .then(data => {
          //console.log(data);

				if(searchval!=''){
					var getcount=10;
					console.log(searchval)
//					findobj=Object.assign({},data);
					findobj["$or"]=[{
						"Name":{'$regex':searchval,
								'$options':'i'},
					},{
						"Rule":{'$regex':searchval,
								'$options':'i'},
					},{
						"Location":{'$regex':searchval,
								'$options':'i'},
					},
						{
						"Owner":{'$regex':searchval,
								'$options':'i'},
					}
					]
				console.log(findobj)
				community.find(findobj).countDocuments(function(e,coun){
					getcount=coun;
				})
					.then(data2 => {
					console.log(data2)

					community.find(findobj).skip(parseInt(req.body.start)).limit(parseInt(req.body.length))
						.then(data1=>{
						console.log(data1)
						res.send({"recordsTotal": count,
            "recordsFiltered": getcount,
            data:data1
								 })
					})
					.catch(err => {
          console.error(err)
          res.send(err);
        })
				})
					.catch(err=>{
					console.log(err)
					res.send(err)
				})
				}

				else
          {
			  res.send({
            "recordsTotal": count,
            "recordsFiltered": count,
            data
          });
		  }
        })
        .catch(err => {
          console.error(err)
          res.send(err);
        })
		}

		else if (querystatus != 0) {
      community.find({
          "Rule": querystatus,
        }, {
          "_id": 0
        }).limit(parseInt(req.body.length)).skip(parseInt(req.body.start))
        .then(data => {
          //console.log(data);
          if(searchval!=''){
					var getcount=10;
					console.log(searchval)
			  findobj.Rule=querystatus;
//					findobj=Object.assign({},data);
					findobj["$or"]=[{
						"Name":{'$regex':searchval,
								'$options':'i'},
					},{
						"Rule":{'$regex':searchval,
								'$options':'i'},
					},{
						"Location":{'$regex':searchval,
								'$options':'i'},
					},
						{
						"Owner":{'$regex':searchval,
								'$options':'i'},
					}
					]
				console.log(findobj)
				community.find(findobj).countDocuments(function(e,coun){
					getcount=coun;
				})
					.then(data2 => {
					console.log(data2)

					community.find(findobj).skip(parseInt(req.body.start)).limit(parseInt(req.body.length))
						.then(data1=>{
						console.log(data1)
						res.send({"recordsTotal": count,
            "recordsFiltered": getcount,
            data:data1
								 })
					})
					.catch(err => {
          console.error(err)
          res.send(err);
        })
				})
					.catch(err=>{
					console.log(err)
					res.send(err)
				})
				}

				else
          {
			  res.send({
            "recordsTotal": count,
            "recordsFiltered": count,
            data
          });
		  }
        })
    }


});
app.get('/listcomms/:id',(req,res)=>{

    res.render('communitylist',{
		userd:req.session
    })


})
app.post('/AddCommunity', upload.single('community-'), function (req, res) {
  console.log(req.body);
  console.log(req.file);


        var finalImg;
        if (req.file) {
            final = {
      path:req.file.path,
      contentType: req.file.mimetype,
   }
        } else {
            final = {
      path:"./public1/myupload/community.jpg",
   }
        }
        var today = new Date();
	var date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
	date=date.toString();
        let newcomm = new community({
          Name: req.body.communityName,
          final: finalImg,
          Owner: req.session.email,
          Rule: req.body.communityMembershipRule,
          Description: req.body.description,
          Members: [req.session.ID],
          Status: "Active",
		  Location:"Not Added",
          Date: date,
        });
        newcomm.save()
          .then(data => {
			console.log(data)
			product.findOneAndUpdate({
				_id:req.session.ID
			},{
				$push:{
					commsadmin:data._id,
					commsin:data._id
				}
			},{safe: true, upsert: true},
    function(err, doc) {
        if(err){
        console.log(err);
            res.send(err)
        }else{
        //do stuff
            res.redirect(`/commpanel/${req.session.ID}`);
        }
    }

);
          })
          .catch(err => {
            console.error(err)
            res.send(error)
          })

});
app.post('/gettagslist',function(req,res){

		var count;
		count = tag.countDocuments({}, function (error, c) {
      count = c;
    });
		console.log(req.body)
		var findobj={};
				var searchval=req.body.search.value;

			tag.find({}, {
        }).limit(parseInt(req.body.length)).skip(parseInt(req.body.start))
        .then(data => {
          //console.log(data);

				if(searchval!=''){
					var getcount=10;
					console.log(searchval)
//					findobj=Object.assign({},data);
					findobj["$or"]=[{
						"Name":{'$regex':searchval,
								'$options':'i'},
					},{
						"By":{'$regex':searchval,
								'$options':'i'},
					}

					]
				console.log(findobj)
				tag.find(findobj).countDocuments(function(e,coun){
					getcount=coun;
				})
					.then(data2 => {
					console.log(data2)

					tag.find(findobj).skip(parseInt(req.body.start)).limit(parseInt(req.body.length))
						.then(data1=>{
						console.log(data1)
						res.send({"recordsTotal": count,
            "recordsFiltered": getcount,
            data:data1
								 })
					})
					.catch(err => {
          console.error(err)
          res.send(err);
        })
				})
					.catch(err=>{
					console.log(err)
					res.send(err)
				})
				}

				else
          {
			  res.send({
            "recordsTotal": count,
            "recordsFiltered": count,
            data
          });
		  }
        })
        .catch(err => {
          console.error(err)
          res.send(err);
        })


});

app.post('/addtag',function(req,res){
console.log(req.body)
	var today = new Date();
	var date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
	date=date.toString();

    let   newtag=new tag({
                      Name:req.body.tagname,
						By:req.session.email,
						Date:date
                  })
           tag.find({Name:req.body.tagname})

      .then(data => {
          if(data.length==0)
              {
               newtag.save()
                  res.send("Added");
              }
          else{
          console.log(data)
          res.send("Already added")
          }
        })
        .catch(err => {
          console.error(err)
          res.send(error)
        })
  })
app.post('/update_profile',function (req, res) {
  //console.log(req.body);
  product.findOneAndUpdate(
  {
      email: req.session.email,
      //password: req.body.oldpass  // search query
  },
  {
    user: req.body.user,
    city: req.body.city,
    phno: req.body.phoneno,
    dob: req.body.dob,
    gender: req.body.gender, // field:values to update
    photopath:req.session.photopath
  },
  {
    new: true,                       // return updated doc
    runValidators: true              // validate before update
  })
       .then(data => {
         //req.session.password=req.body.newpass
         console.log(req.session)
         console.log(data)
         res.send("UPDATED")
       })
       .catch(err => {
          console.error(err)
          res.send("INVALID")
       })
})
//passport
const passport = require('passport');
app.use(passport.initialize());
app.use(passport.session());

app.get('/success', (req, res) => res.render("1"));
app.get('/error', (req, res) => res.send("error logging in"));

passport.serializeUser(function(user, cb) {
  cb(null, user);
});

passport.deserializeUser(function(obj, cb) {
  cb(null, obj);
});

/*  GITHUB AUTH  */

const GitHubStrategy = require('passport-github').Strategy;

const GITHUB_CLIENT_ID = "d233a99389233030bf6e"
const GITHUB_CLIENT_SECRET = "0c22e32f3fab3132918478dd90ee8f949bd15a73";

passport.use(new GitHubStrategy({
    clientID: GITHUB_CLIENT_ID,
    clientSecret: GITHUB_CLIENT_SECRET,
    callbackURL: "/auth/github/callback"
  },
  function(accessToken, refreshToken, profile, cb) {
      return cb(null, profile);
  }
));

app.get('/auth/github',
  passport.authenticate('github'));

app.get('/auth/github/callback',
  passport.authenticate('github', { failureRedirect: '/error' }),
  function(req, res) {
    res.redirect('/1');
  });

  app.post('/update_details',function (req, res) {
    product.findOneAndUpdate(
    {
        user: req.body.old,  // search query
    },
    {
        phno:req.body.phone,
        city:req.body.city,
        status:req.body.status1,
        roll:req.body.role1,
        email:req.body.email


    },
    {
      new: true,                       // return updated doc
      runValidators: true              // validate before update
    })
         .then(data => {
           console.log(data)
           res.send("UPDATED")
         })
         .catch(err => {
            console.error(err)
            res.send("INVALID")
         })
  })
  app.get('/getcommphoto/:id', (req, res) => {
      console.log(req.session)
  	community.findOne({
      _id:req.params.id
  })
         .then(data => {
         res.contentType('image/jpeg');
            res.send(data.final.path)
          })
          .catch(err => {
            console.error(err)
            res.send(error)
          })
  });

  // app.post('/getinfoforddofcommunity' , function (req,res)
  // {
  //   console.log(req.body.membershiprule);
  //   communitydb.find
  //   ({
  //   MembershipRule : req.body.membershiprule
  //   })
  //   .then(data =>
  //   {
  //     res.send(data);
  //     console.log(data);
  //   })
  // })

  // app.get('/getinfoforcommunity', middleFunc ,function(req,res)
  // {
  //   //console.log(req.session)
  //     communitydb.find
  //     ({
  //
  //     })
  //     .then(data => {
  //         //console.log(data)
  //         res.send(data)
  //       })
  //       .catch(err => {
  //         console.error(err)
  //         res.send(error)
  //       })
  // })


  // app.post('/updatedeactive',function (req, res) {
  //   product.findOneAndUpdate(
  //   {
  //       user: req.body.user,  // search query
  //   },
  //   {
  //       active: '0',
  //   },
  //   {
  //     new: true,                       // return updated doc
  //     runValidators: true              // validate before update
  //   })
  //        .then(data => {
  //          console.log(data)
  //          res.send("CHANGED")
  //        })
  //        .catch(err => {
  //           console.error(err)
  //           res.send("INVALID")
  //        })
  // })
  // app.post('/updateactive',function (req, res) {
  //   product.findOneAndUpdate(
  //   {
  //       user: req.body.user,  // search query
  //   },
  //   {
  //       active: '1',
  //   },
  //   {
  //     new: true,                       // return updated doc
  //     runValidators: true              // validate before update
  //   })
  //        .then(data => {
  //          console.log(data)
  //          console.log("***ll");
  //          res.send("CHANGED")
  //        })
  //        .catch(err => {
  //           console.error(err)
  //           res.send("INVALID")
  //        })
  // })
  app.get('/getdata',function(req,res)
{
  //console.log(req);
  product.find
  ({
    email :req.session.email,


  })
     .then(data => {
       console.log(data+"******************");
       res.send(data)

     })
     .catch(err => {
       console.log("11");
       console.error(err)
       res.send(error)
     })
  //res.send(req.session);
})
//   app.get('/getdata/:id',function(req,res)
// {
  //console.log(req);
//   product.findOne
//   ({
//     _id :req.params.email,
//
//
//   })
//      .then(data => {
//        console.log(data+"******************");
//        res.send(data)
//
//      })
//      .catch(err => {
//        console.log("11");
//        console.error(err)
//        res.send(error)
//      })
//   //res.send(req.session);
// })





app.get('/getdatac',function(req,res)
{
//console.log(req);
product.find
({
  //email :req.session.email,


})
   .then(data => {
     //console.log(data);
     res.send(data)

   })
   .catch(err => {
     console.log("22");
     console.error(err)
     res.send(error)
   })
//res.send(req.session);
})
app.post('/change',function(req,res)
{
  console.log(req.body);
  product.findOneAndUpdate(
  {
      password: req.body.old_pass  // search query
  },
  {
    password: req.body.new_pass   // field:values to update
  },
  {
    new: true,                       // return updated doc
    runValidators: true              // validate before update
  })
  .then(data => {
      console.log(data)
      console.log("hh");
        if(data.length)
        {
          console.log("Dd");
        res.send("not done");
      }
        else
        {
      res.send("done")

    }

    })
    .catch(err => {
      console.log("33");
      console.error(err)
      res.send("invalid")
    })
})

app.post('/adduser',function(req,res)
{
 //console.log(req.body);
  var newUser=new product({
    user:req.body.user,
    email:req.body.email,
    password:req.body.password,
    city:req.body.city,
    phno:req.body.phno,
    gender:'NONE',
    dob:'NONE',
    roll:req.body.roll,
    active:0,
    status:'confirmed',
  //  active:req.body.active
  })
  product.find({email:req.body.email})
  .then(data=>
  {
    if(data.length==0)
    {
        newUser.save();
        res.send("ADDED");
    }
    else {
      res.send("Already added");
    }
  })


   .catch(err => {
     console.log("44");
     console.error(err)
     res.send(error)
   })
   var transporter = nodemailer.createTransport({
service: 'gmail',
auth: {
  user: 'dishaproject26@gmail.com',
  pass: 'disha1234'
}
});

var mailOptions = {
from: 'dishaproject26@gmail.com',
to: req.body.email,
subject: 'Welcome',
text: 'Welcome to community! Have a nice day ! -Disha Kumra'
};

transporter.sendMail(mailOptions, function(error, info){
if (error) {
  console.log(error);
} else {
  console.log('Email sent: ' + info.response);
}
});
})

  app.post('/check',function (req, res) {

  //  console.log(req.body.password);
  console.log(req.body.userid);
  console.log("ss");
    product.find
    ({
      email :req.body.userid,
      password :req.body.password
    })
     .then(data => {
       //console.log(data)
       if(data!="")

              {
                console.log(data.roll);
                //console.log("ssss");
                if(data.length!='[]' && data[0].roll=='user')
                {
                  req.session.email = data[0].email ;
                   req.session.user = data[0].user;
                   req.session.password=data[0].password;
                   req.session.photopath=data[0].photopath;
                   req.session.touser=0;
                   req.session.roll=data[0].roll;
                     req.session.ID=data[0]._id;



                res.send("UPDATE");
              }
                else{
                  console.log(data)
                  // req.session.isLogin = 1;
                    req.session.email = data[0].email ;
                     req.session.user = data[0].user;
                     req.session.password=data[0].password;
                     req.session.photopath=data[0].photopath;
                     req.session.touser=0;
                     req.session.roll=data[0].roll;
                       req.session.ID=data[0]._id;
		 res.send("yes");
   }
			  }

        else
       res.send("no");

     })
     .catch(err => {
       console.log("55");
       console.error(err)
       res.send("TRY AGAIN")
     })

  });
  app.listen(4000);
