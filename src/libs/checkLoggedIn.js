const checkLoggedIN =(ctx,next) => {
    if(!ctx.state.user){
        ctx.status = 401 ; // 권한이없음
        return
    }
    return next()
}

module.exports = checkLoggedIN