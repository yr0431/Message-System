var express = require('express');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var bcrypt = require('bcryptjs');
var jwt = require('jwt-simple');
var morgan = require('morgan');

var app = express();

var JWT_SECRET = 'ruiyang'

mongoose.connect('mongodb://admin:admin@ds139989.mlab.com:39989/message_system'||'mongodb://localhost/assignment5');
var db = mongoose.connection;

db.on('open', function(){
	console.log('Connection established');
});

var user_schema = mongoose.Schema({
	"username" : {type : String, lowercase : true, required : true, unique : true},
	"password" : {type : String, required : true},
	"firstname" : {type : String, required : true},
	"lastname" : {type : String, required : true},
	"email" : {type : String, lowercase : true, required : true, unique : true},
	"phone" : {type : String, lowercase : true, required : true, unique : true},
	"location" : {type : String, required : true},
	"avatar_url" : {type : String, default : '/images/default-user.png'}
});

	// user_schema.path('email').validate(validator.isEmail(), 'Please provide a valid email address');

var user_model = mongoose.model('users', user_schema);

var message_schema = mongoose.Schema({
	"recipient" : {type : String, lowercase : true, required : true},
	"recipient_img" : {type : String, lowercase : true, required : true},
	"sender": {type : String, lowercase : true, required : true},
	"sender_img" : {type : String, lowercase : true, required : true},
	"subject" : {type : String, required : true, default : "No Subject"},
	"message" : {type : String},
	"date" : {type : Date, required : true, default : Date.now},
	"important" : {type : Boolean, required : true, default : false},
	"read": {type : Boolean, required : true, default : false}
});

var message_model = mongoose.model('messages', message_schema);

app.use(morgan(':method :url :response-time'));

app.use(bodyParser.json());

app.use(express.static('public'));


app.listen(process.env.Port || 3000, function () {
	console.log('Listening on port'+process.env.Port+'!');
});

app.get('/', function(req,res){
	res.sendFile(__dirname+'/public/login.html');
});

app.post('/user/login', function(req,res){
	console.log('login');
	user_model.findOne({'username': req.body.username}, function(err, user){
		if(err){
			console.log(err);
		}else{
			if (user != null) {
				bcrypt.compare(req.body.password, user.password, function(err, result){
					if(result){
						var token = jwt.encode(user, JWT_SECRET);
						res.json({token:token});
					}else {
						res.status(404).send({'message':'Invalid username or password'});
					}
				});
			}else {
				res.status(404).send({'message':'Invalid username or password'});
			}
		}
		
	});
});

app.post('/user/register', function(req, res){

	bcrypt.genSalt(10, function(err, salt){
		bcrypt.hash(req.body.password, salt, function(err, hash){
			req.body.password = hash;
			var user_obj = req.body;
			var user = user_model(user_obj);
			user.save();
			res.send();
		});
	});
});

app.post('/user/verify', function(req, res){
	var user = jwt.decode(req.body.token, JWT_SECRET);
	res.send({'username' : user.username});
});

app.post('/user/exist', function(req, res){
	user_model.findOne({'username': req.body.username}, function(err, user){
		if(err){
			console.log(err);
			res.send('error happened');
		}else{
			if (user != null) {
				res.send(true);
			} else{
				res.send(false);
			}
		}
	});
});

app.post('/message/received', function(req,res){
	
	message_model
	.find({'recipient' : req.body.username})
	.sort('-date')
	.exec(function(err, messages){
		res.send(messages);
	});
});

app.post('/message/important', function(req,res){
	message_model
	.find({'recipient' : req.body.username, 'important' : true})
	.sort('-date')
	.exec(function(err, messages){
		res.send(messages);
	});
});

app.post('/message/sent', function(req,res){
	
	message_model
	.find({'sender' : req.body.username})
	.sort('-date')
	.exec(function(err, messages){
		res.send(messages);
	});
});

app.post('/message/setflag', function(req,res){
	message_model.update({'_id': req.body._id},{important : req.body.important}, function (err, response) {
		if(err){
			console.log('error when setting flag');
		}else{
			console.log('current flag: '+req.body.important);
			res.send();
		}
	})
})

app.post('/message/new', function(req,res){
	user_model.findOne({'username': req.body.recipient},function(err, recipient){
			if (recipient != null) {
				user_model.findOne({'username': req.body.sender},function(err, sender){
					var message_obj = {
					"recipient" : recipient.username,
					"recipient_img" : recipient.avatar_url,
					"sender": sender.username,
					"sender_img" : sender.avatar_url,
					"subject" : req.body.subject,
					"message" : req.body.message,
					}
					var message = message_model(message_obj);
					message.save();
					console.log('message sent successfully');
					res.send();
				});
				
			}else {
				res.status(404).send({'message':'Invalid username or password'});
			}
		});
});

app.post('/message/delete', function(req, res){
	message_model.remove({'_id': req.body._id}, function(err, response){
		if(err){
			console.log('error when deleting message');
		}else{
			console.log('deletion success');
			res.send();
		}
	});
});

app.post('/profile/getuserdata', function(req, res){
	user_model.findOne({'username': req.body.username}, function(err, user){
		if(user!=null){
			res.send(user);
		}else{
			res.status(404).send();
		}
	});
});

app.post('/profile/verify', function(req,res){
	user_model.findOne({'username': req.body.username}, function(err, user){
		if(err){
			console.log(err);
		}else{
			if (user != null) {
				bcrypt.compare(req.body.password, user.password, function(err, result){
					res.send(result);
				});
			}else {
				res.status(404).send('Error happened when verifying user identity');
			}
		}
		
	});
})

app.post('/profile/update',function(req,res){
	
	var storedata = function (user) {
		delete req.body.password_verify;
		var data = req.body;
		console.log(data);
		user_model.update({'username' : user.username}, data, function(err, result){
			if (err) {
				console.log(err)
			}else {
				res.send(result);
			}
		})
	}
	if(req.body.password_verify){
		user_model.findOne({'username': req.body.username}, function(err, user){
			bcrypt.compare(req.body.password_verify, user.password, function(err, result){
				if(result){
					var wait;
					if(req.body.password){
						bcrypt.genSalt(10, function(err, salt){
							bcrypt.hash(req.body.password, salt, function(err, hash){
								req.body.password = hash;
								console.log(req.body);
								storedata(user);
							});
						});
					}else{
						storedata(user);
					}
				}else{
					res.data(400).send('Invalid identity!');
				}
			});
		}); 
	} else {
		res.status(400).send('Invalid update! Please enter password to verify your identity!');
	}
});

app.get('*', function(req, res){
	res.redirect('/#'+req.originalUrl);
});






