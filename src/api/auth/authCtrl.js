//클래스 
const User =require('../../modeuls/user')

const Joi = require('joi') 

exports.register = async(ctx,next) => {
    const schema = Joi.object().keys({
        username: Joi.string().min(3).max(20).regex(/^[a-zA-Z0-9!@#$%^&*]+$/).required(),
        password: Joi.string().min(3).max(20).regex(/^[a-zA-Z0-9!@#$%^&*]+$/).required()
    })
    
    const result = schema.validate(ctx.request.body) //글러브?
    if(result.error){
        ctx.status = 400;
        ctx.body = result.error
        return;
    }
    const {username,password} = ctx.request.body; // 여기다 심는다 ? client(frontend) 에서 던져주는 데이터( post)
    try{
        //몽고디비 명령어 함수작성한거 넣어준거임
        //User 클래스 정적함수 
        const exists = await User.findByUsername(username)//몽고디비에서 명령어 findOne
        if(exists){
            ctx.status = 409 //Conflit 이름이 똑같으면 중복되는 에러
            return;
        }
        //객체 선언 
        const user = new User({
            username,
        });
        //객체 user 메소드 함수 
        await user.setPassword(password)
        await user.save() // 몽고디비명령어 저장
        
        const data = user.toJSON();
        delete data.hashedPassword;
        ctx.body = data; // client(frontend)에게 던져주는 것(auth)

        console.log(data)
        //쿠키 만들기 
        const token = user.generateToken();
        ctx.cookies.set('access_token',token,{
            maxAge:1000*60*60*24*7, //7 일 계산 밀리초 
            httpOnly: true, // 이부분은  나중에 false로 바꾼다 https를 쓴다 
        })
    }catch(e){
        throw(500,e)
    }
}

exports.login = async(ctx,next) => {
    const {username,password} = ctx.request.body
    if(!username || !password){
        ctx.status = 401 //너잘못 unauthorized 노 권환
        return;
    }
    try{
        //클래스로 사용하는 함수
        const user = await User.findByUsername(username)
        if(!user){
            ctx.status = 401 // 권한 없음
            return;
        }
        //객체로 사용하는 함수 
        const valid = await user.checkPassword(password);
        if(!valid){
            ctx.status = 401 //unauthorized
            return;
        }
        const data = user.toJSON();
        delete data.hashedPassword;
        ctx.body = data;  // client(frontend)에게 던져주는 것(auth)
        //쿠키 
        const token = user.generateToken();
        ctx.cookies.set('access_token',token,{
            maxAge:1000*60*60*24*7, //7 일 계산 밀리초 
            httpOnly: true, // 이부분은  나중에 false로 바꾼다 https를 쓴다 
        })
    }catch(e){
        throw(500,e)
    }
}

exports.logout = async(ctx,next) => {
  ctx.cookies.set('access_token')  //로그아웃 쿠키삭제 
    ctx.status = 204 //No content 아무고또없다
}

exports.check = async(ctx,next) => {
    const {user} = ctx.state;
    if(!user){
        ctx.status = 401 //권한이없다
        return
    }
    ctx.body = user;
}