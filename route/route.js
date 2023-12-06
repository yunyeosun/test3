const Informations = require('../DB/informations-definition');
const Personalities = require('../DB/personalities-definition');
const perm = require('./permutation.js');
const routeFunc = require('./getRoute.js');
require('dotenv').config({ path: '../.env' });

async function route(userId) {
    const user = await Personalities.findOne({ user_id: userId });
    const user_info = await Informations.find({ user_id: userId });
    const travel_day = user.travel_day;
    let result = [];
    // 여행이 당일치기인 경우
    if (travel_day === 1) {
        // 버스터미널 정보
        let destinations_seq0 = user_info.filter(info => info.information_seq === 0).map(info => {
            return {
                seq: info.information_seq, type: info.information_type, day: info.information_day, name: info.information_name, location: info.information_location, address: info.information_address
            }
        });
        // 여행지 정보
        let destinations = user_info.filter(info => info.information_type === '여행지' && info.information_seq !== 0).map(info => {
            return {
                seq: info.information_seq, type: info.information_type, day: info.information_day, name: info.information_name, location: info.information_location, address: info.information_address
            }
        }); // 음식점 정보
        let restaurants = user_info.filter(info => info.information_type === '음식점').map(info => {
            return {
                seq: info.information_seq, type: info.information_type, day: info.information_day, name: info.information_name, location: info.information_location, address: info.information_address
            }
        });
        //console.log(destinations)
        // 당일 모든 경우의 수
        let Combinations_day1 = perm.getAllCombinations1_day1(destinations_seq0, destinations, restaurants);
        //console.log(Combinations_day1.length);
        //console.log("조합의 개수:", Combinations_day1.length); // 생성된 조합의 개수 출력
        //console.log(Combinations_day1[0]);
        //console.log(Combinations_day1[0][0].location);
        //console.log(Combinations_day1[0][0].location.latitude);
        //console.log(Combinations_day1[0][2].information_location); // { latitude: 37.506259, longitude: 127.009341 }
        let minimum_totalTime = Infinity; // 경로 최소 이동시간 (초기값 무한)
        let minimum_totalTime_index = -1; // 최소 이동시간일 때 인덱스를 구하기 위한 변수
        for (let i = 0; i < Combinations_day1.length; i++) { // 모든 경우의 수에서
            let locations = []; // 주소 정보를 종합하는 배열
            for (let j = 0; j < Combinations_day1[i].length; j++) { // 주소 정보 저장
                let location_xy = { "x": Combinations_day1[i][j].location.longitude, "y": Combinations_day1[i][j].location.latitude } // x값은 경도, y값은 위도
                locations.push(location_xy);
            }
            //console.log(locations)
            let curTotalTime = await routeFunc.getRouteTime(i, locations); // 해당 주소 정보를 바탕으로 경로 이동시간 검색
            //console.log(curTotalTime)
            if (curTotalTime < minimum_totalTime) { // 최솟값보다 현재 경로 이동시간이 적다면
                minimum_totalTime = curTotalTime; // 해당값으로 최솟값 교체
                minimum_totalTime_index = i; // 인덱스도 현재 인덱스로 교체
            }
            if (i === 5) { // [임시] api 과다 호출을 막기 위한 값
                break;
            }
        }
        let best_route_index = minimum_totalTime_index; // 최소 이동시간일 때 인덱스
        let result_day1 = Combinations_day1[best_route_index];
        //console.log(result_day1)
        //console.log("1일차 가장 최적 경로 경우의 수는", best_route_index); // 가장 최적 경로 경우의 수는 0
        //console.log(result_day1)
        //console.log(Combinations_day1[best_route_index]);
        //console.log(locations);
        //console.log(locations[0])
        //getRoute(locations);
        result.push(result_day1);
        //console.log(result)
    }

    // 여행이 1박 2일인 경우
    else if (travel_day === 2) {
        // 버스터미널 정보
        let destinations_seq0 = user_info.filter(info => info.information_seq === 0).map(info => {
            return {
                seq: info.information_seq, type: info.information_type, day: info.information_day, name: info.information_name, location: info.information_location, address: info.information_address
            }
        });
        // 1일차 여행지 정보
        let destinations_day1 = user_info.filter(info => info.information_type === '여행지' && info.information_seq !== 0 && info.information_day === 1).map(info => {
            return {
                seq: info.information_seq, type: info.information_type, day: info.information_day, name: info.information_name, location: info.information_location, address: info.information_address
            }
        });
        // 1일차 음식점 정보
        let restaurants_day1 = user_info.filter(info => info.information_type === '음식점' && info.information_day === 1).map(info => {
            return {
                seq: info.information_seq, type: info.information_type, day: info.information_day, name: info.information_name, location: info.information_location, address: info.information_address
            }
        });
        // 1일차 숙소 정보
        let accommodations_day1 = user_info.filter(info => info.information_type === '숙소' && info.information_day === 1).map(info => {
            return {
                seq: info.information_seq, type: info.information_type, day: info.information_day, name: info.information_name, location: info.information_location, address: info.information_address
            }
        });
        // 2일차 여행지 정보
        let destinations_day2 = user_info.filter(info => info.information_type === '여행지' && info.information_day === 2).map(info => {
            return {
                seq: info.information_seq, type: info.information_type, day: info.information_day, name: info.information_name, location: info.information_location, address: info.information_address
            }
        });
        // 2일차 음식점 정보
        let restaurants_day2 = user_info.filter(info => info.information_type === '음식점' && info.information_day === 2).map(info => {
            return {
                seq: info.information_seq, type: info.information_type, day: info.information_day, name: info.information_name, location: info.information_location, address: info.information_address
            }
        });
        // 1일차 모든 경우의 수
        let Combinations_day1 = perm.getAllCombinations2or3_day1(destinations_seq0, destinations_day1, restaurants_day1, accommodations_day1);
        // 2일차 모든 경우의 수
        let Combinations_day2 = perm.getAllCombinations2_day2(destinations_day2, restaurants_day2);
        //console.log("조합의 개수:", Combinations_day1.length); // 생성된 조합의 개수 출력
        //console.log(Combinations_day1[0]);
        //console.log("조합의 개수:", Combinations_day2.length); // 생성된 조합의 개수 출력
        //console.log(Combinations_day2[0]);

        // 1일차 경로 이동시간 계산
        let minimum_totalTime = Infinity; // 경로 최소 이동시간 (초기값 무한)
        let minimum_totalTime_index = -1; // 최소 이동시간일 때 인덱스를 구하기 위한 변수
        for (let i = 0; i < Combinations_day1.length; i++) { // 모든 경우의 수에서
            let locations = []; // 주소 정보를 종합하는 배열
            for (let j = 0; j < Combinations_day1[i].length; j++) { // 주소 정보 저장
                let location_xy = { "x": Combinations_day1[i][j].location.longitude, "y": Combinations_day1[i][j].location.latitude } // x값은 경도, y값은 위도
                locations.push(location_xy);
            }
            let curTotalTime = await routeFunc.getRouteTime(i, locations); // 해당 주소 정보를 바탕으로 경로 이동시간 검색
            //console.log(curTotalTime)
            if (curTotalTime < minimum_totalTime) { // 최솟값보다 현재 경로 이동시간이 적다면
                minimum_totalTime = curTotalTime; // 해당값으로 최솟값 교체
                minimum_totalTime_index = i; // 인덱스도 현재 인덱스로 교체
            }
            if (i === 3) { // [임시] api 과다 호출을 막기 위한 값
                break;
            }
        }
        let best_route_index_day1 = minimum_totalTime_index; // 최소 이동시간일 때 인덱스
        let result_day1 = Combinations_day1[best_route_index_day1]; // 1일차 최적 경로 장소 정보
        //console.log("1일차 가장 최적 경로 경우의 수는", best_route_index_day1);
        result.push(result_day1);

        // 2일차 경로 이동시간 계산
        minimum_totalTime = Infinity; // 경로 최소 이동시간 (초기값 무한)
        minimum_totalTime_index = -1; // 최소 이동시간일 때 인덱스를 구하기 위한 변수
        for (let i = 0; i < Combinations_day2.length; i++) { // 모든 경우의 수에서
            let locations = []; // 주소 정보를 종합하는 배열
            for (let j = 0; j < Combinations_day2[i].length; j++) { // 주소 정보 저장
                let location_xy = { "x": Combinations_day1[i][j].location.longitude, "y": Combinations_day1[i][j].location.latitude } // x값은 경도, y값은 위도
                locations.push(location_xy);
            }
            let curTotalTime = await routeFunc.getRouteTime(i, locations); // 해당 주소 정보를 바탕으로 경로 이동시간 검색
            //console.log(curTotalTime)
            if (curTotalTime < minimum_totalTime) { // 최솟값보다 현재 경로 이동시간이 적다면
                minimum_totalTime = curTotalTime; // 해당값으로 최솟값 교체
                minimum_totalTime_index = i; // 인덱스도 현재 인덱스로 교체
            }
            if (i === 3) { // [임시] api 과다 호출을 막기 위한 값
                break;
            }
        }
        let best_route_index_day2 = minimum_totalTime_index; // 최소 이동시간일 때 인덱스
        let result_day2 = Combinations_day2[best_route_index_day2]; // 2일차 최적 경로 장소 정보
        //console.log("2일차 가장 최적 경로 경우의 수는", best_route_index_day2);
        result.push(result_day2);
        //console.log(result)
    }

    // 여행이 2박 3일인 경우
    else if (travel_day === 3) {
        // 버스터미널 정보
        let destinations_seq0 = user_info.filter(info => info.information_seq === 0).map(info => {
            return {
                seq: info.information_seq, type: info.information_type, day: info.information_day, name: info.information_name, location: info.information_location, address: info.information_address
            }
        });
        // 1일차 여행지 정보
        let destinations_day1 = user_info.filter(info => info.information_type === '여행지' && info.information_seq !== 0 && info.information_day === 1).map(info => {
            return {
                seq: info.information_seq, type: info.information_type, day: info.information_day, name: info.information_name, location: info.information_location, address: info.information_address
            }
        });
        // 1일차 음식점 정보
        let restaurants_day1 = user_info.filter(info => info.information_type === '음식점' && info.information_day === 1).map(info => {
            return {
                seq: info.information_seq, type: info.information_type, day: info.information_day, name: info.information_name, location: info.information_location, address: info.information_address
            }
        });
        // 1일차 숙소 정보
        let accommodations_day1 = user_info.filter(info => info.information_type === '숙소' && info.information_day === 1).map(info => {
            return {
                seq: info.information_seq, type: info.information_type, day: info.information_day, name: info.information_name, location: info.information_location, address: info.information_address
            }
        });
        // 2일차 여행지 정보
        let destinations_day2 = user_info.filter(info => info.information_type === '여행지' && info.information_day === 2).map(info => {
            return {
                seq: info.information_seq, type: info.information_type, day: info.information_day, name: info.information_name, location: info.information_location, address: info.information_address
            }
        });
        // 2일차 음식점 정보
        let restaurants_day2 = user_info.filter(info => info.information_type === '음식점' && info.information_day === 2).map(info => {
            return {
                seq: info.information_seq, type: info.information_type, day: info.information_day, name: info.information_name, location: info.information_location, address: info.information_address
            }
        });
        // 2일차 숙소 정보
        let accommodations_day2 = user_info.filter(info => info.information_type === '숙소' && info.information_day === 2).map(info => {
            return {
                seq: info.information_seq, type: info.information_type, day: info.information_day, name: info.information_name, location: info.information_location, address: info.information_address
            }
        });
        // 3일차 여행지 정보
        let destinations_day3 = user_info.filter(info => info.information_type === '여행지' && info.information_day === 3).map(info => {
            return {
                seq: info.information_seq, type: info.information_type, day: info.information_day, name: info.information_name, location: info.information_location, address: info.information_address
            }
        });
        // 3일차 음식점 정보
        let restaurants_day3 = user_info.filter(info => info.information_type === '음식점' && info.information_day === 3).map(info => {
            return {
                seq: info.information_seq, type: info.information_type, day: info.information_day, name: info.information_name, location: info.information_location, address: info.information_address
            }
        });
        // 1일차 모든 경우의 수
        let Combinations_day1 = perm.getAllCombinations2or3_day1(destinations_seq0, destinations_day1, restaurants_day1, accommodations_day1);
        // 2일차 모든 경우의 수
        let Combinations_day2 = perm.getAllCombinations3_day2(destinations_day2, restaurants_day2, accommodations_day2);
        // 3일차 모든 경우의 수
        let Combinations_day3 = perm.getAllCombinations3_day3(destinations_day3, restaurants_day3);
        //console.log("조합의 개수:", Combinations_day1.length); // 생성된 조합의 개수 출력
        //console.log(Combinations_day1[0]);
        //console.log("조합의 개수:", Combinations_day2.length); // 생성된 조합의 개수 출력
        //console.log(Combinations_day2[0]);
        //console.log("조합의 개수:", Combinations_day3.length); // 생성된 조합의 개수 출력
        //console.log(Combinations_day3[0]);

        // 1일차 경로 이동시간 계산
        let minimum_totalTime = Infinity; // 경로 최소 이동시간 (초기값 무한)
        let minimum_totalTime_index = -1; // 최소 이동시간일 때 인덱스를 구하기 위한 변수
        for (let i = 0; i < Combinations_day1.length; i++) { // 모든 경우의 수에서
            let locations = []; // 주소 정보를 종합하는 배열
            for (let j = 0; j < Combinations_day1[i].length; j++) { // 주소 정보 저장
                let location_xy = { "x": Combinations_day1[i][j].location.longitude, "y": Combinations_day1[i][j].location.latitude } // x값은 경도, y값은 위도
                locations.push(location_xy);
            }
            let curTotalTime = await routeFunc.getRouteTime(i, locations); // 해당 주소 정보를 바탕으로 경로 이동시간 검색
            //console.log(curTotalTime)
            if (curTotalTime < minimum_totalTime) { // 최솟값보다 현재 경로 이동시간이 적다면
                minimum_totalTime = curTotalTime; // 해당값으로 최솟값 교체
                minimum_totalTime_index = i; // 인덱스도 현재 인덱스로 교체
            }
            if (i === 3) { // [임시] api 과다 호출을 막기 위한 값
                break;
            }
        }
        let best_route_index_day1 = minimum_totalTime_index; // 최소 이동시간일 때 인덱스
        let result_day1 = Combinations_day1[best_route_index_day1]; // 1일차 최적 경로 장소 정보
        //console.log("1일차 가장 최적 경로 경우의 수는", best_route_index_day1);
        result.push(result_day1);

        // 2일차 경로 이동시간 계산
        minimum_totalTime = Infinity; // 경로 최소 이동시간 (초기값 무한)
        minimum_totalTime_index = -1; // 최소 이동시간일 때 인덱스를 구하기 위한 변수
        for (let i = 0; i < Combinations_day2.length; i++) { // 모든 경우의 수에서
            let locations = []; // 주소 정보를 종합하는 배열
            for (let j = 0; j < Combinations_day2[i].length; j++) { // 주소 정보 저장
                let location_xy = { "x": Combinations_day1[i][j].location.longitude, "y": Combinations_day1[i][j].location.latitude } // x값은 경도, y값은 위도
                locations.push(location_xy);
            }
            let curTotalTime = await routeFunc.getRouteTime(i, locations); // 해당 주소 정보를 바탕으로 경로 이동시간 검색
            //console.log(curTotalTime)
            if (curTotalTime < minimum_totalTime) { // 최솟값보다 현재 경로 이동시간이 적다면
                minimum_totalTime = curTotalTime; // 해당값으로 최솟값 교체
                minimum_totalTime_index = i; // 인덱스도 현재 인덱스로 교체
            }
            if (i === 3) { // [임시] api 과다 호출을 막기 위한 값
                break;
            }
        }
        let best_route_index_day2 = minimum_totalTime_index; // 최소 이동시간일 때 인덱스
        let result_day2 = Combinations_day2[best_route_index_day2]; // 2일차 최적 경로 장소 정보
        //console.log("2일차 가장 최적 경로 경우의 수는", best_route_index_day2);
        result.push(result_day2);

        // 3일차 경로 이동시간 계산
        minimum_totalTime = Infinity; // 경로 최소 이동시간 (초기값 무한)
        minimum_totalTime_index = -1; // 최소 이동시간일 때 인덱스를 구하기 위한 변수
        for (let i = 0; i < Combinations_day3.length; i++) { // 모든 경우의 수에서
            let locations = []; // 주소 정보를 종합하는 배열
            for (let j = 0; j < Combinations_day3[i].length; j++) { // 주소 정보 저장
                let location_xy = { "x": Combinations_day1[i][j].location.longitude, "y": Combinations_day1[i][j].location.latitude } // x값은 경도, y값은 위도
                locations.push(location_xy);
            }
            let curTotalTime = await routeFunc.getRouteTime(i, locations); // 해당 주소 정보를 바탕으로 경로 이동시간 검색
            //console.log(curTotalTime)
            if (curTotalTime < minimum_totalTime) { // 최솟값보다 현재 경로 이동시간이 적다면
                minimum_totalTime = curTotalTime; // 해당값으로 최솟값 교체
                minimum_totalTime_index = i; // 인덱스도 현재 인덱스로 교체
            }
            if (i === 3) { // [임시] api 과다 호출을 막기 위한 값
                break;
            }
        }
        let best_route_index_day3 = minimum_totalTime_index; // 최소 이동시간일 때 인덱스
        let result_day3 = Combinations_day3[best_route_index_day3]; // 3일차 최적 경로 장소 정보
        //console.log("3일차 가장 최적 경로 경우의 수는", best_route_index_day3);
        result.push(result_day3);
        //console.log(result)
    }
    return result;
}

module.exports = route;