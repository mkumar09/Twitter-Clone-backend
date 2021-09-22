const User=require('./models/user');
const Follower = require('./models/follower')
const {auth} =require('./middlewares/auth');
const express=require('express');
const mongoose= require('mongoose');
const bodyparser=require('body-parser');
const cookieParser=require('cookie-parser');
const Tweet = require('./models/tweet');
const follower = require('./models/follower');
const db=require('./config/config').get(process.env.NODE_ENV);


const app=express();
// app use
app.use(bodyparser.urlencoded({extended : false}));
app.use(bodyparser.json());
app.use(cookieParser());

// database connection
mongoose.Promise=global.Promise;
mongoose.connect(db.DATABASE,{ useNewUrlParser: true,useUnifiedTopology:true },function(err){
    if(err) console.log(err);
    console.log("database is connected");
});

app.post('/api/register',function(req,res){
    // taking a user
    const newuser=new User(req.body);
    
   if(newuser.password!=newuser.password2)return res.status(400).json({message: "password not match"});
    
    User.findOne({email:newuser.email},function(err,user){
        if(user) return res.status(400).json({ auth : false, message :"email exits"});
 
        newuser.save((err,doc)=>{
            if(err) {console.log(err);
                return res.status(400).json({ success : false});}
            res.status(200).json({
                succes:true,
                user : doc
            });
        });
    });
 });

 app.post('/api/addTweet',function(req,res){
     const tweet = new Tweet(req.body);
    tweet.timestamp = new Date();

     tweet.save((err,doc)=>{
        if(err) {console.log(err);
            return res.status(400).json({ success : false});}
        res.status(200).json({
            succes:true,
            user : doc
        });
 })
});

 app.post('/api/login', function(req,res){
    let token=req.cookies.auth;
    User.findByToken(token,(err,user)=>{
        if(err) return  res(err);
        if(user) return res.status(400).json({
            error :true,
            message:"You are already logged in"
        });
    
        else{
            User.findOne({'email':req.body.email},function(err,user){
                if(!user) return res.json({isAuth : false, message : ' Auth failed ,email not found'});
        
                user.comparepassword(req.body.password,(err,isMatch)=>{
                    if(!isMatch) return res.json({ isAuth : false,message : "password doesn't match"});
        
                user.generateToken((err,user)=>{
                    if(err) return res.status(400).send(err);
                    res.cookie('auth',user.token).json({
                        isAuth : true,
                        id : user._id
                        ,email : user.email
                    });
                });    
            });
          });
        }
    });
});

app.post('/api/addfollower',function(req,res){

    //var emailoffollower = req.Follower.emailoffollower;
    const follower = new Follower(req.body);

    follower.save((err,doc)=>{
        if(err) {console.log(err);
            return res.status(400).json({ success : false});}
        res.status(200).json({
            succes:true,
            user : doc
        });
 });
});
// get logged in user
app.get('/api/profile', auth, function (req, res) {


    var email1 = req.user.email;
    var followers_data = [];
    var tweets = [];

    follower.find({ emailoffollowee: email1 }, async (err, results) => {
        if (err)
            console.log(err);
        else {
            results.map((d, k) => {
                followers_data.push(d.emailoffollower);
            })
            for (var i = 0; i < followers_data.length; i++) {
                let results1 = await Tweet.find({ author: followers_data[i] });
                        results1.map((d, k) => {
                            tweets.push(d);
                        })
                    }
            }
            tweets.sort((a, b) => (b.timestamp - a.timestamp));

            res.json({
                isAuth: true,
                id: req.user._id,
                email: req.user.email,
                name: req.user.firstname + req.user.lastname,
                followers: followers_data,
                tweet: tweets

            });
    })
        .catch(error => {
            console.log(error);
        })
});

//logout user
app.get('/api/logout',auth,function(req,res){
    req.user.deleteToken(req.token,(err,user)=>{
        if(err) return res.status(400).send(err);
        res.sendStatus(200);
    });

}); 

app.get('/',function(req,res){
    res.status(200).send(`Welcome to login , sign-up api`);
});

// listening port
const PORT=process.env.PORT||3000;
app.listen(PORT,()=>{
    console.log(`app is live at ${PORT}`);
})