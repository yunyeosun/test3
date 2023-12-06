// personalities collection 정의
const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const personalitiesSchema = new Schema({
    // 스키마 정의
    user_id: { type: Number, required: true }, // 유저 id 
    travel_destination: { type: String, required: true }, // 여행지역
    start_day: { type: String, required: true }, // 여행시작일
    finish_day: { type: String, required: true }, // 여행종료일
    travel_day: { type: Number, required: true }, // 여행일(당일치기는 1, 1박 2일은 2, 2박 3일은 3)
    rank_mountain: { type: Number, required: true }, // 여행지_산 우선순위
    rank_sea: { type: Number, required: true }, // 여행지_바다 우선순위
    rank_historicalTheme: { type: Number, required: true }, // 여행지_역사관광지 우선순위
    rank_experienceTheme: { type: Number, required: true }, // 여행지_체험관광지 우선순위
    rank_buildingTheme: { type: Number, required: true }, // 여행지_건축/조형물 우선순위
    rank_cafe: { type: Number, required: true }, // 여행지_카페 우선순위
    rank_koreanfood: { type: Number, required: true }, // 음식_한식 우선순위
    rank_japanesefood: { type: Number, required: true }, // 음식_일식 우선순위
    rank_chinesefood: { type: Number, required: true }, // 음식_중식 우선순위
    rank_westernfood: { type: Number, required: true }, // 음식_양식 우선순위
    rank_fastfood: { type: Number, required: true }, // 음식_패스트푸드 우선순위
    rank_meat: { type: Number, required: true }, // 음식_고기/구이 우선순위
    rank_hotel: { type: Number, required: true }, // 숙박_호텔 우선순위
    rank_motel: { type: Number, required: true }, // 숙박_모텔 우선순위
    rank_pension: { type: Number, required: true }, // 숙박_펜션 우선순위
}, { collection: 'personalities' });

const Personalities = mongoose.model('Personalities', personalitiesSchema);

module.exports = Personalities; // 모델을 export