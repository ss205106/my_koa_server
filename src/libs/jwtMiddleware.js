const jwt = require('jsonwebtoken')
const User = require("../modeuls/user")
const jwtMiddleware = async (ctx,next) => {
    const token = ctx.cookies.get('access_token')

    if(!token) return next()
    try{
    const decoded = jwt.verify(token,process.env.JWT_SECRET) //암호화풀어줌

    ctx.state.user = {
        id:decoded._id,
        username: decoded.username
    }
  
    const now = Math.floor(Date.now() / 1000)
    if(decoded.exp - now < 60*60*24*3.5){
        const user = await User.findByID(decoded._id);
        const token = user.generateToken()
        ctx.cookies.set('access_token',newToken,{
            maxAge: 1000*60*60*24* 7,  //7일 
            hyypOnly: true
        })
    }
    return next()
    }
    catch(e){
        return next()
    }
}

module.exports = jwtMiddleware