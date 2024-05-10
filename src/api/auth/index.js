const Router = require('koa-router')
const authCtrl = require('./authCtrl')

const auth = new Router()     

//get(데이터 가져오기) , post(삽입) ,delete(삭제), put(삽입), patch(수정)

auth.post('/register',authCtrl.register)
auth.post('/login',authCtrl.login)
auth.post('/logout',authCtrl.logout)
auth.get('/check',authCtrl.check)

module.exports  = auth