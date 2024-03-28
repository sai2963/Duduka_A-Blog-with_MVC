const mongodbstore=require('connect-mongodb-session');

function createSessionStore(session){
    const Mongodbstore=mongodbstore(session);
    const sessionStore=new Mongodbstore({
        uri:'mongodb://localhost:27017',
        databaseName:'authorize'
    })
    return sessionStore;
}
function createSessionconfig(sessionStore){
    return {
        secret:'super-secret',
        resave:false,
        saveUninitialized:false,
        store:sessionStore,
        cookie:{
            maxAge:30*24*60*60*1000
        }
    }
}

module.exports={
    createSessionStore:createSessionStore,
    createSessionconfig:createSessionconfig
}