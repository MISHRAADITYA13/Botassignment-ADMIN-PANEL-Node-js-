require("dotenv").config();
const express = require("express");
const app=express();
const cors=require("cors");
require("./database/connection")
const PORT=6005;
const session=require("express-session");
const passport=require("passport");
const OAuth2Strategy=require("passport-google-oauth2").Strategy;
const clientid="509977058966-d2om52gprgfc1p3ld3sn275lknr3rkh4.apps.googleusercontent.com";
const userdb=require("./model/userSchema");
const clientsecret="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";

app.use(cors({
origin:"http://localhost:3000/",
methods:"GET,POST,PUT,DELETE",
credentials:true
}));
app.use(express.json());//frontend se hmjo bhi data  kerenge wo json ke form me hoga

//setup session
app.use(session({           //basically jab bhi ham google login krenge toh yeh encrypted form me ek id create kareaga
secret:"225475Aditya1@",     //or woh id hoga session id and if we decode that session id then we get the info of user
resave:false,
saveUninitialized:true
}))
//setting up passport
app.use(passport.initialize());
app.use(passport.session());

passport.use(
    new OAuth2Strategy({
        clientID:clientid,
        clientSecret:clientsecret,
        callbackURL:"/auth/google/callback",
        scope:["profile","email"]
    },
    async(accessToken,refreshToken,profile,done)=>{
        // console.log("profile",profile)
        try {
            let user = await userdb.findOne({googleId:profile.id});

            if(!user){
                user = new userdb({
                    googleId:profile.id,
                    displayName:profile.displayName,
                    email:profile.emails[0].value,
                    image:profile.photos[0].value
                });

                await user.save();
            }

            return done(null,user)
        } catch (error) {
            return done(error,null)
        }
    }
    )
)
passport.serializeUser((user,done)=>{
    done(null,user);
})

passport.deserializeUser((user,done)=>{
    done(null,user);
});

// app.get("/",(req,res)=>{
//     res.status(200).json("server is running")
// });
app.get("/auth/google",passport.authenticate("google",{scope:["profile","email"]}));

app.get("/auth/google/callback",passport.authenticate("google",{
    successRedirect:"http://localhost:3000/dashboard",
    failureRedirect:"http://localhost:3000/login"
}))

app.get("/login/sucess",async(req,res)=>{

    if(req.user){
        res.status(200).json({message:"user Login",user:req.user})
    }else{
        res.status(400).json({message:"Not Authorized"})
    }
})

app.get("/logout",(req,res,next)=>{
    req.logout(function(err){
        if(err){return next(err)}
        res.redirect("http://localhost:3000");
    })
})

app.listen(PORT,()=>{
    console.log(`server start at port no ${PORT}`)
})