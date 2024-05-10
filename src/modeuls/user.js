const mongoose = require('mongoose');
const {Schema} = mongoose  //데이터 베이스 설정할떄 만드는 테이블 (?)
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

const UserSchema = new Schema({    //테이블 키의 타입을 정함 뭐 받을건지 설정하기
    username: String,
    hashedPassword : String,
})
//hash 패스워드 암호화 한다 
UserSchema.methods.setPassword = async function(password){
    const hash = await bcrypt.hash(password,10);
    this.hashedPassword = hash
}
// 몽고 db에 있는 메소드 비밀번호 비교 
UserSchema.methods.checkPassword = async function(password){
    const result = await bcrypt.compare(password,this.hashedPassword)
    return result; // ok이면 true 아니면 false
}
// 몽고 지원 메소드 id찾는 함수 정적함수 
UserSchema.statics.findByUsername = function(username){
    return this.findOne({username})
}

UserSchema.methods.generateToken = function(){
    const token = jwt.sign(       //sign 에 인수 3개 
        {
            _id: this.id,
            username: this.username,
        },
        process.env.JWT_SECRET,
        {
            expiresIn : '7d',
        }
    )
    return token
}

const User = mongoose.model('User',UserSchema,"UserCollection")
//테이블 넣기 "post"이 있어도 "postCollection"을 쓰면 겉으로 보이는 이름은 postCollectiondl이거임

module.exports = User ;  //export defalt
