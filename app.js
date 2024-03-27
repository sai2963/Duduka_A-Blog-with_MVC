const express=require('express')
const app= express();
const session =require('express-session');
const mongodbstore=require('connect-mongodb-session');
const Mongodbstore=mongodbstore(session);
const sessionStore=new Mongodbstore({
    uri:'mongodb://localhost:27017',
    databaseName:'authorize'
})
const router=require('./routes/route');
const db=require('./data/database')
const bodyParser = require('body-parser');
app.use('/images',express.static('images'));
app.use(express.static('views'));

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(session({
    secret:'super-secret',
    resave:false,
    saveUninitialized:false,
    store:sessionStore,
    cookie:{
        maxAge:30*24*60*60*1000
    }
}));
app.use(router)
app.set('view engine', 'ejs')
app.get('/',(req,res)=>{
    res.redirect('home')
})
db.connectToDatabase().then(function (){
    app.listen(5000,()=>{
        console.log('Server is Running')
    })
})
