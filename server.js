const mongoose = require('mongoose')
const express = require("express")
const https = require("https")
const bodyParser=require("body-parser")
const validator = require("validator")
const session = require('express-session')
const passport = require('passport')
const path = require('path')
const stripe = require('stripe')('sk_test_51Jd5Q0B1CZO3bhnPy6poTvtPPKTEWZgifHQvDtPsbhmEFGOtWN93NT1AWM8wN37nEHSw20NqkwlUCgvFm4oYqHgt007WaILtZc')
const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy
const { createBrotliCompress } = require('zlib')
//mongoose.connect("mongodb://localhost:27017/taskDB", { useNewUrlParser: true })
mongoose.connect("mongodb+srv://student-shen:5N2mmXqV@cluster0.kl0tg.mongodb.net/taskDB?retryWrites=true&w=majority", { useNewUrlParser: true })
const PORT = process.env.PORT || 8000
const ip = "127.0.0.1";
//const db = []

const userSchema = new mongoose.Schema({
    Country: {
        type: String,
        require: true,
        minlength: [1,"country is required"]

    },
    FirstName: {
        type: String,
        require: true,
        minlength: [1,"first name is required"]

    },
    LastName: {
        type: String,
        require: true,
        min: [1,"last name is required"]
    },
    Email: {
        type: String,
        require: true,
        validate(value){
            if(!validator.isEmail(value)){
                throw new Error("The format of the Email is incorrect")
            }
        }
    },
    Password: {
        type: String,
        require: true,
        minlength:8
    },
    RePassword: {
        type: String,
        require: true,
        minlength: 8,
        validate(value){
            if(!validator.equals(value, this.Password)){
                throw new Error("The comfirm password should be same with passward")
            }
        }
    },
    AddressOne: {
        type: String,
        require: true,
        minlength: [1,"road name is required"]
    },
    AddressTwo: {
        type: String,
        require: true,
        minlength: [1,"street name is required"]
    },
    City: {
        type: String,
        require: true,
        minlength: [1,"city name is required"]
    },
    State: {
        type: String,
        require: true,
        minlength: [1,"state name is required"]
    },
    Zip: {
        type: String,
        require: false
    },
    MobileNum: {
        type: Number,
        require: false
    }
})

const data = mongoose.model('data', userSchema)

const app = express()
app.use(bodyParser.urlencoded({extended:true}))
app.use(express.static("public"))

app.get("/",(req,res)=>{
    res.sendFile(__dirname + "/registration.html")
})

app.post('/',(req,res)=>{
        const Country= req.body.country
        const FirstName= req.body.firstName
        const LastName= req.body.lastName
        const Email= req.body.email
        const Password= req.body.password
        const RePassword= req.body.rePassword
        const AddressOne= req.body.addressOne
        const AddressTwo= req.body.addressTwo
        const City= req.body.city
        const State= req.body.state
        const Zip= req.body.zip
        const MobileNum= req.body.phone

        //const saltRounds = 10
        // bcrypt.genSalt(saltRounds, function (err, salt){
        //     bcrypt.hash(Password, salt, function(err, hash){
        //         hash == Password;
        //         console.log(hash);
        //     })      
        // })

        // const salt = bcrypt.genSaltSync(saltRounds);
        // const hash = bcrypt.hashSync(Password, salt);
        // console.log(hash);
        // db[Password] = hash;
        
        const accountdata = new data({
            Country: Country,
            FirstName: FirstName,
            LastName: LastName,
            Email: Email,
            Password: Password,
            RePassword: RePassword,
            AddressOne: AddressOne,
            AddressTwo: AddressTwo,
            City: City,
            State: State,
            Zip: Zip,
            MobileNum: MobileNum
        })

        accountdata.save((err) =>{
            if(err){
               console.log(err)
            }
            else{
                console.log(" New account for new user is added!!!")
            }
        })
        const ApiData = {
            members:[{
                email_address: Email,
                status: "subscribed",
                merge_fields:{
                    FNAME:FirstName,
                    LNAME:LastName
                }
            }]
        }

        jsonData = JSON.stringify(ApiData)

        const url = "https://us5.api.mailchimp.com/3.0/lists/4c18d9549a"
        const options={
            method:"POST",
            auth:"azi:7d245a7c3c3e869cda03c035a4d19ce1"
        }

        const request = https.request(url,options,(response) =>{
            response.on("apidata",(ApiData)=>{
                Console.log(JSON.parse(ApiData))
            })
        })

        request.write(jsonData)
        request.end()
        console.log(Email)
})

app.listen(process.env.PORT);
let port = process.env.PORT;

 app.listen(8000, (req,res)=>{
     console.log(`server is running at http://${ip}:${PORT}`);
     
})


app.get('/login.html', (req,res)=>{
    res.sendFile(__dirname + "/login.html")
})

app.post('/login.html', (req,res)=>{
    const email = req.body.email
    const Password = req.body.password

    data.findOne({Email: email}, function(error, foundUser){
        if(!error){
            if(foundUser){
                // if(bcrypt.compareSync(Password, db[Password])){
                //     res.sendFile(__dirname + "/custtask.html")
                // }
                // else{
                //     res.sendFile(__dirname + "/404.html")
                // }

                res.sendFile(__dirname + "/custtask.html")
            }else{
                     res.sendFile(__dirname + "/404.html")
                 }
        }
    })
})


// google login express server

app.set('view engine','ejs')

app.use(session({
    resave:false,
    saveUninitialized: true,
    secret:'SECRET'
}));

app.get('/',function(req,res){
    res.render('pages/auth');
});

// google login passport 


var userProfile

app.use(passport.initialize());
app.use(passport.session());

app.set('view engine','ejs');

app.get('/success',function(req,res){
    res.sendFile(__dirname + "/views/payment.html")
});

app.get('/error',function(req,res){
    res.send('error loggin in');
});

passport.serializeUser(function(user,a){
    a(null, user);
});

passport.deserializeUser(function(obj,a){
    a(null, obj)
});

// google login authentication

const GOOGLE_CLIENT_ID = '365771967080-2rsi133pb6896po603d9hqp4mb73ikc3.apps.googleusercontent.com';
const GOOGLE_CLIENT_SECRET = '1VcNM0DFTnqSd0zF3077G81q';

passport.use(new GoogleStrategy({
    clientID: GOOGLE_CLIENT_ID,
    clientSecret: GOOGLE_CLIENT_SECRET,
    callbackURL:"https://evening-retreat-13853.herokuapp.com/auth/google/callback"
    },
    function(accessToken,refreshToken,profile,done){
        userProfile = profile;
        return done(null,userProfile);
    }
));

app.get('/auth/google',passport.authenticate('google',{scope:['profile','email']}));

app.get('/auth/google/callback',passport.authenticate('google',{failureRedirect:'/error'}),
    function(req,res){
        res.redirect('/success');
    }
);


// payment page



app.set('view engine', 'ejs');
app.engine('html', require('ejs').renderFile);

app.use(express.static(path.join(__dirname, './views')));

app.post('/charge', (req, res) => {
    try {
        stripe.customers.create({
            name: req.body.name,
            email: req.body.email,
            source: req.body.stripeToken
        }).then(customer => stripe.charges.create({
            amount: req.body.amount * 100,
            currency: 'usd',
            customer: customer.id,
            description: 'Thank you '
        })).then(() => res.render('complete.html'))
            .catch(err => console.log(err))
    } catch (err) { res.send(err) }
})
