const { authenticate } = require('passport/lib')


//i have created this file so that server.js doesnt become too big and this will store all Authentication code
const LocalStrategy = require('passport-local').Strategy
const bcrypt = require('bcrypt')

function initialize(passport,getUserByEmail,getUserById) {
    const authenticateUser = async ( email ,password, done ) => {
     const user = getUserByEmail(email)
     if (user==null){
         return done(null, false,{message: 'No User found with that Email'})
     }
     try {
         if(await bcrypt.compare(password, user.password)){
            return done(null, user)

         }else{
             return done(null, false,{message: 'Password is incorrect'})

         }
         
     } catch (e) {
         return done(e)
     }
    }

    passport.use(new LocalStrategy({ usernameField: 'email' },authenticateUser))
    passport.serializeUser((user,done) => done(null,user.id))
    passport.deserializeUser((id,done) => {
    return done(null,getUserById(id))
    })

}

module.exports = initialize