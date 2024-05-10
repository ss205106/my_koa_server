const Router = require('koa-router')
const posts = require('./posts');
const auth = require('./auth')

const api = new Router()

api.use('/posts',posts.routes())
api.use('/auth',auth.routes())

module.exports = api    //export default 와 같은거 