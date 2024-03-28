const express=require('express')
const app= express();
const session =require('express-session');
const sessionconfig=require('./config/session')
const router=require('./routes/route');
const authroute=require('./routes/auth');
const db=require('./data/database')
const mongoDbSessionStore=sessionconfig.createSessionStore(session);
const bodyParser = require('body-parser');
app.use('/images',express.static('images'));
app.use(express.static('views'));

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(session(sessionconfig.createSessionconfig(mongoDbSessionStore)));
//app.use(sessionconfig)
app.use(router)
app.use(authroute)
app.set('view engine', 'ejs')
app.get('/',(req,res)=>{
    res.redirect('home')
})
db.connectToDatabase().then(function (){
    app.listen(5000,()=>{
        console.log('Server is Running')
    })
})
