const Informations = require('../DB/informations-definition.js');
const Personalities = require('../DB/personalities-definition.js');
const perm = require('./permutation.js');
const routeFunc = require('./getRoute.js');
const haversine = require('./haversine.js');
require('dotenv').config({ path: '../.env' });

async function route_ver2(userId) {
    const user = await Personalities.findOne({ user_id: userId });
    const user_info = await Informations.find({ user_id: userId });
    const travel_day = user.travel_day;
    let result = [];
    // 여행이 당일치기인 경우
    if (travel_day === 1) {
        // 버스터미널 정보
        let destinations_seq0 = user_info.filter(info => info.information_seq === 0).map(info => {
            return {
                seq: info.information_seq, type: info.information_type, day: info.information_day, name: info.information_name,
                location: info.information_location, address: info.information_address, price: info.information_price, image_url: info.information_imageUrl
            }
        });
        // 여행지 정보
        let destinations = user_info.filter(info => info.information_type === '여행지' && info.information_seq !== 0).map(info => {
            return {
                seq: info.information_seq, type: info.information_type, day: info.information_day, name: info.information_name,
                location: info.information_location, address: info.information_address, price: info.information_price,
                image_url: info.information_imageUrl, check_val: 0
            }
        }); // 음식점 정보
        let restaurants = user_info.filter(info => info.information_type === '음식점').map(info => {
            return {
                seq: info.information_seq, type: info.information_type, day: info.information_day, name: info.information_name,
                location: info.information_location, address: info.information_address, price: info.information_price,
                image_url: info.information_imageUrl, check_val: 0
            }
        });
        let latitude = destinations_seq0[0].location.latitude;
        let longitude = destinations_seq0[0].location.longitude;
        //console.log("위도 경도", destinations[0].location.latitude, destinations[0].location.longitude)
        result.push(destinations_seq0[0]) // 버스터미널 먼저 저장
        for (let i = 0; i < 7; i++) {
            let min_difference = Infinity // 두 장소간 거리 차이
            let idx = -1 // 장소 인덱스
            if (i % 2 == 0) { // 여행지 추천
                for (let j = 0; j < destinations.length; j++) { // 가장 거리가 짧은 값 탐색
                    diff = await haversine.haversine(latitude, longitude, destinations[j].location.latitude, destinations[j].location.longitude)
                    if (destinations[j].check_val === 0 && diff < min_difference) {
                        min_difference = diff;
                        idx = j;
                    }
                }
                // 삽입
                result.push(destinations[idx])
                destinations[idx].check_val = 1;
                // 좌표 최신화
                latitude = destinations[idx].location.latitude;
                longitude = destinations[idx].location.longitude;
            }
            else { // 음식점 추천
                for (let j = 0; j < restaurants.length; j++) { // 가장 거리가 짧은 값 탐색
                    diff = await haversine.haversine(latitude, longitude, restaurants[j].location.latitude, restaurants[j].location.longitude)
                    if (restaurants[j].check_val === 0 && diff < min_difference) {
                        min_difference = diff;
                        idx = j;
                    }
                }
                // 삽입
                restaurants[idx].check_val = 1;
                result.push(restaurants[idx])
                // 좌표 최신화
                latitude = restaurants[idx].location.latitude;
                longitude = restaurants[idx].location.longitude;
            }
        }
    }

    // 여행이 1박 2일인 경우
    else if (travel_day === 2) {
        // 버스터미널 정보
        let destinations_seq0 = user_info.filter(info => info.information_seq === 0).map(info => {
            return {
                seq: info.information_seq, type: info.information_type, day: info.information_day, name: info.information_name,
                location: info.information_location, address: info.information_address, price: info.information_price, image_url: info.information_imageUrl
            }
        });
        // 1일차 여행지 정보
        let destinations_day1 = user_info.filter(info => info.information_type === '여행지' && info.information_seq !== 0 && info.information_day === 1).map(info => {
            return {
                seq: info.information_seq, type: info.information_type, day: info.information_day, name: info.information_name,
                location: info.information_location, address: info.information_address, price: info.information_price,
                image_url: info.information_imageUrl, check_val: 0
            }
        });
        // 1일차 음식점 정보
        let restaurants_day1 = user_info.filter(info => info.information_type === '음식점' && info.information_day === 1).map(info => {
            return {
                seq: info.information_seq, type: info.information_type, day: info.information_day, name: info.information_name,
                location: info.information_location, address: info.information_address, price: info.information_price,
                image_url: info.information_imageUrl, check_val: 0
            }
        });
        // 1일차 숙소 정보
        let accommodations_day1 = user_info.filter(info => info.information_type === '숙소' && info.information_day === 1).map(info => {
            return {
                seq: info.information_seq, type: info.information_type, day: info.information_day, name: info.information_name,
                location: info.information_location, address: info.information_address, price: info.information_price,
                image_url: info.information_imageUrl, check_val: 0
            }
        });
        // 2일차 여행지 정보
        let destinations_day2 = user_info.filter(info => info.information_type === '여행지' && info.information_day === 2).map(info => {
            return {
                seq: info.information_seq, type: info.information_type, day: info.information_day, name: info.information_name,
                location: info.information_location, address: info.information_address, price: info.information_price,
                image_url: info.information_imageUrl, check_val: 0
            }
        });
        // 2일차 음식점 정보
        let restaurants_day2 = user_info.filter(info => info.information_type === '음식점' && info.information_day === 2).map(info => {
            return {
                seq: info.information_seq, type: info.information_type, day: info.information_day, name: info.information_name,
                location: info.information_location, address: info.information_address, price: info.information_price,
                image_url: info.information_imageUrl, check_val: 0
            }
        });
        // 1일차 일정 계산
        let latitude = destinations_seq0[0].location.latitude;
        let longitude = destinations_seq0[0].location.longitude;
        result.push(destinations_seq0[0]) // 버스터미널 먼저 저장
        for (let i = 0; i < 7; i++) {
            let min_difference = Infinity // 두 장소간 거리 차이
            let idx = -1 // 장소 인덱스
            if (i % 2 == 0) { // 여행지 추천
                for (let j = 0; j < destinations_day1.length; j++) { // 가장 거리가 짧은 값 탐색
                    diff = await haversine.haversine(latitude, longitude, destinations_day1[j].location.latitude, destinations_day1[j].location.longitude)
                    if (destinations_day1[j].check_val === 0 && diff < min_difference) {
                        min_difference = diff;
                        idx = j;
                    }
                }
                // 삽입
                result.push(destinations_day1[idx])
                destinations_day1[idx].check_val = 1;
                // 좌표 최신화
                latitude = destinations_day1[idx].location.latitude;
                longitude = destinations_day1[idx].location.longitude;
            }
            else { // 음식점 추천
                for (let j = 0; j < restaurants_day1.length; j++) { // 가장 거리가 짧은 값 탐색
                    diff = await haversine.haversine(latitude, longitude, restaurants_day1[j].location.latitude, restaurants_day1[j].location.longitude)
                    if (restaurants_day1[j].check_val === 0 && diff < min_difference) {
                        min_difference = diff;
                        idx = j;
                    }
                }
                // 삽입
                restaurants_day1[idx].check_val = 1;
                result.push(restaurants_day1[idx])
                // 좌표 최신화
                latitude = restaurants_day1[idx].location.latitude;
                longitude = restaurants_day1[idx].location.longitude;
            }
        }
        result.push(accommodations_day1[0]); // 1일차 숙소 저장
        // 숙소 좌표로 위치 최신화
        latitude = accommodations_day1[0].location.latitude;
        longitude = accommodations_day1[0].location.longitude;
        // 2일차 일정 계산
        for (let i = 0; i < 7; i++) {
            let min_difference = Infinity // 두 장소간 거리 차이
            let idx = -1 // 장소 인덱스
            if (i % 2 == 0) { // 여행지 추천
                for (let j = 0; j < destinations_day2.length; j++) { // 가장 거리가 짧은 값 탐색
                    diff = await haversine.haversine(latitude, longitude, destinations_day2[j].location.latitude, destinations_day2[j].location.longitude)
                    if (destinations_day2[j].check_val === 0 && diff < min_difference) {
                        min_difference = diff;
                        idx = j;
                    }
                }
                // 삽입
                result.push(destinations_day2[idx])
                destinations_day2[idx].check_val = 1;
                // 좌표 최신화
                latitude = destinations_day2[idx].location.latitude;
                longitude = destinations_day2[idx].location.longitude;
            }
            else { // 음식점 추천
                for (let j = 0; j < restaurants_day2.length; j++) { // 가장 거리가 짧은 값 탐색
                    diff = await haversine.haversine(latitude, longitude, restaurants_day2[j].location.latitude, restaurants_day2[j].location.longitude)
                    if (restaurants_day2[j].check_val === 0 && diff < min_difference) {
                        min_difference = diff;
                        idx = j;
                    }
                }
                // 삽입
                restaurants_day2[idx].check_val = 1;
                result.push(restaurants_day2[idx])
                // 좌표 최신화
                latitude = restaurants_day2[idx].location.latitude;
                longitude = restaurants_day2[idx].location.longitude;
            }
        }
    }

    // 여행이 2박 3일인 경우
    else if (travel_day === 3) {
        // 버스터미널 정보
        let destinations_seq0 = user_info.filter(info => info.information_seq === 0).map(info => {
            return {
                seq: info.information_seq, type: info.information_type, day: info.information_day, name: info.information_name,
                location: info.information_location, address: info.information_address, price: info.information_price, image_url: info.information_imageUrl
            }
        });
        // 1일차 여행지 정보
        let destinations_day1 = user_info.filter(info => info.information_type === '여행지' && info.information_seq !== 0 && info.information_day === 1).map(info => {
            return {
                seq: info.information_seq, type: info.information_type, day: info.information_day, name: info.information_name,
                location: info.information_location, address: info.information_address, price: info.information_price,
                image_url: info.information_imageUrl, check_val: 0
            }
        });
        // 1일차 음식점 정보
        let restaurants_day1 = user_info.filter(info => info.information_type === '음식점' && info.information_day === 1).map(info => {
            return {
                seq: info.information_seq, type: info.information_type, day: info.information_day, name: info.information_name,
                location: info.information_location, address: info.information_address, price: info.information_price,
                image_url: info.information_imageUrl, check_val: 0
            }
        });
        // 1일차 숙소 정보
        let accommodations_day1 = user_info.filter(info => info.information_type === '숙소' && info.information_day === 1).map(info => {
            return {
                seq: info.information_seq, type: info.information_type, day: info.information_day, name: info.information_name,
                location: info.information_location, address: info.information_address, price: info.information_price,
                image_url: info.information_imageUrl, check_val: 0
            }
        });
        // 2일차 여행지 정보
        let destinations_day2 = user_info.filter(info => info.information_type === '여행지' && info.information_day === 2).map(info => {
            return {
                seq: info.information_seq, type: info.information_type, day: info.information_day, name: info.information_name,
                location: info.information_location, address: info.information_address, price: info.information_price,
                image_url: info.information_imageUrl, check_val: 0
            }
        });
        // 2일차 음식점 정보
        let restaurants_day2 = user_info.filter(info => info.information_type === '음식점' && info.information_day === 2).map(info => {
            return {
                seq: info.information_seq, type: info.information_type, day: info.information_day, name: info.information_name,
                location: info.information_location, address: info.information_address, price: info.information_price,
                image_url: info.information_imageUrl, check_val: 0
            }
        });
        // 2일차 숙소 정보
        let accommodations_day2 = user_info.filter(info => info.information_type === '숙소' && info.information_day === 2).map(info => {
            return {
                seq: info.information_seq, type: info.information_type, day: info.information_day, name: info.information_name,
                location: info.information_location, address: info.information_address, price: info.information_price,
                image_url: info.information_imageUrl, check_val: 0
            }
        });
        // 3일차 여행지 정보
        let destinations_day3 = user_info.filter(info => info.information_type === '여행지' && info.information_day === 3).map(info => {
            return {
                seq: info.information_seq, type: info.information_type, day: info.information_day, name: info.information_name,
                location: info.information_location, address: info.information_address, price: info.information_price,
                image_url: info.information_imageUrl, check_val: 0
            }
        });
        // 3일차 음식점 정보
        let restaurants_day3 = user_info.filter(info => info.information_type === '음식점' && info.information_day === 3).map(info => {
            return {
                seq: info.information_seq, type: info.information_type, day: info.information_day, name: info.information_name,
                location: info.information_location, address: info.information_address, price: info.information_price,
                image_url: info.information_imageUrl, check_val: 0
            }
        });
        // 1일차 일정 계산
        let latitude = destinations_seq0[0].location.latitude;
        let longitude = destinations_seq0[0].location.longitude;
        result.push(destinations_seq0[0]) // 버스터미널 먼저 저장
        for (let i = 0; i < 7; i++) {
            let min_difference = Infinity // 두 장소간 거리 차이
            let idx = -1 // 장소 인덱스
            if (i % 2 == 0) { // 여행지 추천
                for (let j = 0; j < destinations_day1.length; j++) { // 가장 거리가 짧은 값 탐색
                    diff = await haversine.haversine(latitude, longitude, destinations_day1[j].location.latitude, destinations_day1[j].location.longitude)
                    if (destinations_day1[j].check_val === 0 && diff < min_difference) {
                        min_difference = diff;
                        idx = j;
                    }
                }
                // 삽입
                result.push(destinations_day1[idx])
                destinations_day1[idx].check_val = 1;
                // 좌표 최신화
                latitude = destinations_day1[idx].location.latitude;
                longitude = destinations_day1[idx].location.longitude;
            }
            else { // 음식점 추천
                for (let j = 0; j < restaurants_day1.length; j++) { // 가장 거리가 짧은 값 탐색
                    diff = await haversine.haversine(latitude, longitude, restaurants_day1[j].location.latitude, restaurants_day1[j].location.longitude)
                    if (restaurants_day1[j].check_val === 0 && diff < min_difference) {
                        min_difference = diff;
                        idx = j;
                    }
                }
                // 삽입
                restaurants_day1[idx].check_val = 1;
                result.push(restaurants_day1[idx])
                // 좌표 최신화
                latitude = restaurants_day1[idx].location.latitude;
                longitude = restaurants_day1[idx].location.longitude;
            }
        }
        result.push(accommodations_day1[0]); // 1일차 숙소 저장
        // 숙소 좌표로 위치 최신화
        latitude = accommodations_day1[0].location.latitude;
        longitude = accommodations_day1[0].location.longitude;
        // 2일차 일정 계산
        for (let i = 0; i < 7; i++) {
            let min_difference = Infinity // 두 장소간 거리 차이
            let idx = -1 // 장소 인덱스
            if (i % 2 == 0) { // 여행지 추천
                for (let j = 0; j < destinations_day2.length; j++) { // 가장 거리가 짧은 값 탐색
                    diff = await haversine.haversine(latitude, longitude, destinations_day2[j].location.latitude, destinations_day2[j].location.longitude)
                    if (destinations_day2[j].check_val === 0 && diff < min_difference) {
                        min_difference = diff;
                        idx = j;
                    }
                }
                // 삽입
                result.push(destinations_day2[idx])
                destinations_day2[idx].check_val = 1;
                // 좌표 최신화
                latitude = destinations_day2[idx].location.latitude;
                longitude = destinations_day2[idx].location.longitude;
            }
            else { // 음식점 추천
                for (let j = 0; j < restaurants_day2.length; j++) { // 가장 거리가 짧은 값 탐색
                    diff = await haversine.haversine(latitude, longitude, restaurants_day2[j].location.latitude, restaurants_day2[j].location.longitude)
                    if (restaurants_day2[j].check_val === 0 && diff < min_difference) {
                        min_difference = diff;
                        idx = j;
                    }
                }
                // 삽입
                restaurants_day2[idx].check_val = 1;
                result.push(restaurants_day2[idx])
                // 좌표 최신화
                latitude = restaurants_day2[idx].location.latitude;
                longitude = restaurants_day2[idx].location.longitude;
            }
        }
        result.push(accommodations_day2[0]); // 2일차 숙소 저장
        // 숙소 좌표로 위치 최신화
        latitude = accommodations_day2[0].location.latitude;
        longitude = accommodations_day2[0].location.longitude;
        // 3일차 일정 계산
        for (let i = 0; i < 7; i++) {
            let min_difference = Infinity // 두 장소간 거리 차이
            let idx = -1 // 장소 인덱스
            if (i % 2 == 0) { // 여행지 추천
                for (let j = 0; j < destinations_day3.length; j++) { // 가장 거리가 짧은 값 탐색
                    diff = await haversine.haversine(latitude, longitude, destinations_day3[j].location.latitude, destinations_day3[j].location.longitude)
                    if (destinations_day3[j].check_val === 0 && diff < min_difference) {
                        min_difference = diff;
                        idx = j;
                    }
                }
                // 삽입
                result.push(destinations_day3[idx])
                destinations_day3[idx].check_val = 1;
                // 좌표 최신화
                latitude = destinations_day3[idx].location.latitude;
                longitude = destinations_day3[idx].location.longitude;
            }
            else { // 음식점 추천
                for (let j = 0; j < restaurants_day3.length; j++) { // 가장 거리가 짧은 값 탐색
                    diff = await haversine.haversine(latitude, longitude, restaurants_day3[j].location.latitude, restaurants_day3[j].location.longitude)
                    if (restaurants_day3[j].check_val === 0 && diff < min_difference) {
                        min_difference = diff;
                        idx = j;
                    }
                }
                // 삽입
                restaurants_day3[idx].check_val = 1;
                result.push(restaurants_day3[idx])
                // 좌표 최신화
                latitude = restaurants_day3[idx].location.latitude;
                longitude = restaurants_day3[idx].location.longitude;
            }
        }
    }
    return result;
}

module.exports = route_ver2;