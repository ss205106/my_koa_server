const Router = require('koa-router')  //post 라우터 설정 

const posts = new Router()     // new class 
const postsCtrl = require("./postsCtrl") //ㅋ컨트롤러 함수 가져오기 
const checkLoggedIN = require('../../libs/checkLoggedIn')
//get(데이터 가져오기) , post(삽입) ,delete(삭제), put(삽입), patch(수정,update)
// (api) 라우터 : /api/posts

posts.get('/',postsCtrl.list) //가져오기 
posts.post('/', checkLoggedIN, postsCtrl.write) //삽입?

// 라우터 : api/posts/:id
const post = new Router()
   // /posts/:id 라는 주소로 post를 사용하겠다? ㅑ

post.get('/',postsCtrl.read)
post.delete('/',checkLoggedIN , postsCtrl.checkOwnPost , postsCtrl.remove)
post.patch('/', checkLoggedIN , postsCtrl.checkOwnPost , postsCtrl.update)

posts.use("/:id", postsCtrl.getPostById, post.routes())  

module.exports = posts