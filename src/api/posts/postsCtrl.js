const Post = require('../../modeuls/post')

const mongoose = require('mongoose')
const {ObjectId} = mongoose.Types    //16진수인지 확인해야한다?
const Joi = require('joi')   //yarn  add joi 
//joi는 기능을 추가하는듯 .required()를 작성해야 사용할수있음 
//컨트롤러 함수 

exports.checkOwnPost = async (ctx,next) => {
    const {user,post} = ctx.state;
    
    if(post.user.id.toString() !== user.id){
   
        ctx.status = 403 // 금지 
        return;
    }
    return next()
}


exports.getPostById = async (ctx,next) => {
    const {id} = ctx.params;
    console.log(id)
    if(!ObjectId.isValid(id)) {
        ctx.status = 400 // Bad Request
        return;
    }
    try{
        const post = await Post.findById(id)
        if(!post){
            ctx.status = 404 //Not Found
            return;
        }
        ctx.state.post = post;
        return next()
    }
    catch(e){
        ctx.throw(500,3)
    }
}
exports.write = async (ctx,next) =>{ //글작성 컨트롤러함수 

    const schema = Joi.object().keys({
        title:Joi.string().required(),
        body: Joi.string().required(),
        tags: Joi.array()
            .items(Joi.string())  //배열안에 있는 아이템들은 문자열로 하겠다 검사를 한다 검사를 하고 맞으면 ok 아니면 오류가 뜸 
            .required()
    });

    const result = schema.validate(ctx.request.body) //글러브를 만든다 클라이언트가 서버에 보낸 데이터가 스키마의 요구 사항을 충족하는지 확인합니다(검사).(gpt)
    
    if(result.error){
        ctx.status = 400; //Bad Reqeust     4자프론트 잘못 5자 는 백엔드
        ctx.body = result.error
        return;
    }

    const {title,body,tags} = ctx.request.body;  //클라이언트가 요청한 본문 데이터의 있는 필드들을 추출하여 변수에 할당함 
    //PostCollection
    const post = new Post({    //새로운 post객체를 만들어서 객체의 속성으로 본문의데이터 값을 전달
        title,
        body,
        tags,
        user: ctx.state.user
    })

    try{
        await post.save()   //몽고디비 명령어   post를 Mongodb에 저장 
        ctx.body = post; //여기서 쓰는게 포스트맨 에서 나옴
    }
    catch(e){
        ctx.throw(500,e)
    }
}

exports.list = async (ctx,next) => {   //리스트 보여주는 컨트롤러 함수 
    const page = Number(ctx.query.page || "1")          //쿼리에 있는 page의 값을 가져옴 undifind면 1을 할당?
    if(page < 1){             //페이지는 1보다 작으면 안됌
        ctx.status = 400;
        return;
    }
    const {tag,username} = ctx.query
    const query = {
        ...(username ? {'user.username': username} : {}),
        ...(tag ? {tags:tag} : {})
    }
    console.log(query)
    try{
        //몽고디비 명령어 post에서 찾기
        const showNum = 5
        const posts = await Post.find(query).sort({id: -1}) //  데이터베이스에있는 포스트(post) 컬렉션의 모든 문서를 검색하고, 이를 id 역순으로 정렬한 후에 변수 posts에 할당하는 부분입니다.
        .limit(showNum).skip((page-1)*showNum).lean().exec();         

        const postCnt = await Post.countDocuments(query).exec() //countDocuments() Post(포스트컬랙션)에 있는 문서의 총 개수 

        ctx.set("last-page", Math.ceil(postCnt / showNum) || 1 ) // HTTP 응답 헤더를 설정
        //대문자X 소문자 
        ctx.body = posts.map(post =>( {                    //하나씩 보여주는 리스트 생성
            ...post,
            title:post.title,
            body:post.body.length<200 ? post.body : 
            `${post.body.slice(0,200)}...`
           
        }) )
        console.log(ctx.body)
    }
    catch(e){
        ctx.throw(500,e)
    }
}
//여기서부터는 /api/posts/:id 부분 
exports.read = async (ctx,next) =>{
    const {id} = ctx.params;
    try{
        //몽고디비명령어  id가 변수 id와 일치하는 포스트를 가져옴 
        const post = await Post.findById(id).exec()
        if(!post){
            ctx.status = 404 // Not Found
            return ;
        }
        ctx.body = post;
        console.log(post)
    }
    catch(e){
        ctx.throw(500,e)
    }
}

exports.remove = async (ctx,next) =>{
    const {id} = ctx.params
    try{
        //몽고디비 명령어 mongoose 매소드 id가 일치하는 데이터를 지운다 
        await Post.findByIdAndDelete(id).exec()
        ctx.status = 204 //no Comment
    }
    catch(e){
        ctx.throw(500,e)
    }
}
exports.update = async (ctx,next) =>{
    const {id} = ctx.params;     //파라미터 id 를 가져온다
    const schema = Joi.object().keys(           //객체 스키마를 생성 필드 설정 
        {
            title:Joi.string(),
            body:Joi.string(),
            tags:Joi.array().items(Joi.string())
        }
    )
    const result = schema.validate(ctx.request.body)   //클라이언트로부터 요청받은 본문의 데이터를 검사하고 저장함 
    if(result.error){
        ctx.status = 400;
        ctx.body = result.error;
        return; 
    }
    try{
            //mongodb 메소드 mongoose매소드 (업데이트할id,업데이트하는데이터,{new:true}는 업데이트된 데이터를 반환한다)
            const post = await Post.findByIdAndUpdate(     
                id , ctx.request.body , {
                new: true
            } ).exec()
            if(!post){
                ctx.status = 404 ; //Not Found
                return;
            }
            ctx.body = post
            // console.log(post)
    }
    catch(e){
        ctx.throw(500,e)
    }
}