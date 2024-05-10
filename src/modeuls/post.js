const mongoose = require('mongoose');
const {Schema} = mongoose  //데이터 베이스 설정할떄 만드는 테이블 (?)
//블로그 리스트 글쓰기 페이지 에 필요한데이터들 
const PostSchema = new Schema({    //스키마 생성 테이블 키의 타입 설정하기
    title: String,
    body: String,
    tags:[String],
    publishDate: {                   //오늘 날짜를 써줘야함
        type: Date,
        default: Date.now
    },
    user: {
        id:mongoose.Types.ObjectId,
        username:String
    }
})

const Post = mongoose.model('Post',PostSchema,"postCollection") 
//mongodb 테이블 생성 모델 생성 컬렉션 생성 "post"이 있어도 "postCollection"을 쓰면 겉으로 보이는 이름은 postCollectiondl이거임

module.exports = Post ; 


