if (process.env.NODE_ENV !== 'production'){
    require('dotenv').config()
}

const express = require('express')
const app = express()
const bcrypt = require('bcrypt')
const users = []
const passport = require('passport')
const flash = require('express-flash')
const session = require('express-session')
const methodOverride = require('method-override')

const initializePassport = require('./passport-config')
const req = require('express/lib/request')
const res = require('express/lib/response')
initializePassport(
    passport,
    email => users.find(user => user.email === email),
    id=> users.find(user => user.id === id)
)


app.set('view-engine','ejs')
app.use(express.urlencoded ({ extended: false }))
app.use(flash())
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false

}))
app.use(passport.initialize())
app.use(passport.session())
app.use(methodOverride('_method'))

app.get('/',checkAuthenticated,(req,res) => {
    res.render('index.ejs', {name: req.user.name})
})


app.get('/login',checkNotAthenticated,(req,res) => {
    res.render('login.ejs')
}) 

app.post('/login',checkNotAthenticated,passport.authenticate('local',{
    successRedirect: '/',
    failureRedirect: '/login',
    failureFlash: true
    

}))


app.get('/register',checkNotAthenticated,(req,res) => {
    res.render('register.ejs')
})


app.post('/register', checkNotAthenticated, async (req,res) => {
    try {
        const hashedPassword = await bcrypt.hash(req.body.password,10)//Creating a hashed password
        users.push({
            id: Date.now().toString(),
            name: req.body.name,
            email: req.body.email,
            password: hashedPassword// instead of using the password we use the hashed password because it is safer to use

        })
        res.redirect('/login')
        
    } catch  {
        res.redirect('/register')
        
    }
    console.log(users)// everytime we hit reload this variable will automatically be set to a empty array
    
   
})

app.delete('/logout',(req,res) => {
    req.logOut()
    res.redirect('/login')
})
function checkAuthenticated(req,res, next){
    if(req.isAuthenticated()){
        return next()

    }
    res.redirect('/login')
    
}

function checkNotAthenticated(req,res, next){
    if(req.isAuthenticated()){
        return res.redirect('/')
    }
    next()


}

app.listen(3000)