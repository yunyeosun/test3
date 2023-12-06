// edit collection 정의
const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const editsSchema = new Schema({
    // 스키마 정의
    edit_city: { type: String, required: true }, // 지역 이름
    edit_name: { type: String, required: true }, // 장소 이름
    edit_rating: { type: Number, required: false }, // 별점
    edit_location: { type: Object, required: true }, // 위도 및 경도 정보
    edit_address: { type: String, required: true }, // 주소
    edit_type: { type: String, required: true }, // 타입(여행지, 음식점, 숙소)
    edit_category: { type: String, required: true }, // 여행 세부 카테고리(산, 국립공원 등)
    edit_placeID: { type: String, required: false }, // place_id(장소 중복을 방지하기 위한 값)
    edit_cost: { type: Number, required: false } // 경비
}, { collection: 'edits' });

const Edits = mongoose.model('edits', editsSchema);

module.exports = Edits; // 모델을 export