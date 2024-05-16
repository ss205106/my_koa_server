require('dotenv').config()
const Koa = require("koa");
const bodyParser = require('koa-bodyparser')
const Router = require('koa-router');
const mongoose = require("mongoose")
const jwtMiddleware = require('./libs/jwtMiddleware')

const api = require('./api') // 인덱스가 빠져있는거임 주소에 index는 안써도 암묵적으로 들어감

//환경파일 가져오기
const {PORT,MONGO_URI} = process.env

//몽고db연결   몽고db식 연결방법
mongoose
.connect(MONGO_URI)
.then( () => {
    console.log("mongoDB연결성공")
} )
.catch( (e) => {
    console.log(e)
} )

//get(데이터 가져오기) , post(삽입) ,delete(삭제), put(삽입), patch(수정)

//라우터 설정
const app = new Koa();
const router =new Router() //최상위 아버지는 무조건 / 

router.use('/api', api.routes() )

app
.use(bodyParser())
.use(jwtMiddleware) //쿠키 가져오기 
.use(router.routes() )
.use(router.allowedMethods() )

const port = PORT || 4000
app.listen( port, () => {
    console.log( `Listening to port ${port}` )
} ) 