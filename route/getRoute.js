const axios = require('axios');
require('dotenv').config({ path: '../.env' });
const KAKAO_API_KEY = process.env.kakaoAPI; // 카카오맵 API 키

// 이동 시간 계산을 위한 카카오맵 API 요청 함수
async function getRouteTime(num, locations) {
    try {
        const data = {
            origin: locations[0], // 출발지
            destination: locations[locations.length - 1], // 목적지
            waypoints: locations.slice(1, -1), // 경유지
            priority: 'TIME' // Recommend(추천 경로), Time(최단 시간), Distance(최단 경로) 중 하나 (기본값은 Recommend)
        };
        // POST 요청
        const response = await axios.post('https://apis-navi.kakaomobility.com/v1/waypoints/directions', data, {
            headers: {
                Authorization: `KakaoAK ${KAKAO_API_KEY}`,
                'Content-Type': 'application/json'
            }
        });
        // 총 이동 시간 반환
        const totalTime = response.data.routes[0].summary.duration;
        //console.log(`${num}번째 이동시간은 ${totalTime}입니다.`)
        return totalTime;
    } catch (error) {
        console.error(error.response ? error.response.data : error.message);
        return null;
    }
}

async function calculation(array) {
    let minimum_totalTime = Infinity; // 경로 최소 이동시간 (초기값 무한)
    let minimum_totalTime_index = -1; // 최소 이동시간일 때 인덱스를 구하기 위한 변수
    for (let i = 0; i < array.length; i++) { // 모든 경우의 수에서
        let locations = []; // 주소 정보를 종합하는 배열
        for (let j = 0; j < array[i].length; j++) { // 주소 정보 저장
            let location_xy = { "x": array[i][j].location.longitude, "y": array[i][j].location.latitude } // x값은 경도, y값은 위도
            locations.push(location_xy);
        }
        let curTotalTime = await getRouteTime(i, locations); // 해당 주소 정보를 바탕으로 경로 이동시간 검색
        if (curTotalTime < minimum_totalTime) { // 최솟값보다 현재 경로 이동시간이 적다면
            minimum_totalTime = curTotalTime; // 해당값으로 최솟값 교체
            minimum_totalTime_index = i; // 인덱스도 현재 인덱스로 교체
        }
        //if (i === 5) { // [임시] api 과다 호출을 막기 위한 값
        //    break;
        //}
    }
    let best_route_index = minimum_totalTime_index; // 최소 이동시간일 때 인덱스
    return best_route_index
}

module.exports = {
    getRouteTime,
    calculation
}