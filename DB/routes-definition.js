// routes collection 정의
const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const routesSchema = new Schema({
    // 스키마 정의
    user_id: { type: Number, required: true }, // 유저 id 
    //route_seq: { type: Number, required: true }, // 시퀀스(여행지 순서 값)
    route_name: { type: String, required: true }, // 장소 이름
    route_day: { type: Number, required: true }, // 몇일 차 여행일인지 저장하는 값(1일차인지, 2일차인지, 3일차인지)
    route_location: { type: Object, required: true }, // 위도 및 경도 정보
    route_address: { type: String, required: true }, // 주소
    route_type: { type: String, required: false }, // 타입(여행지, 음식점, 숙소)
    route_price: { type: Number, required: false }, // 경비
    route_imageUrl: { type: String, required: false }, // 이미지 url
    food_name: { type: String, required: false }, // 음식점의 메뉴 이름
    food_imageUrl: { type: String, required: false } // 음식점의 메뉴 이미지 url
}, { collection: 'routes' });

const Routes = mongoose.model('routes', routesSchema);

module.exports = Routes; // 모델을 export