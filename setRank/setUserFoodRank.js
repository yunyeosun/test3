// 사용자의 음식 우선순위를 바탕으로 여행지 추천 갯수를 계산하는 함수
const Personalities = require('../DB/personalities-definition.js');

async function setUserFoodRank(userId) {
    try {
        const user = await Personalities.findOne({ user_id: userId }); // 해당 userId의 personalities 데이터를 가져온다.
        if (!user) { // 유저가 존재하지 않는 경우
            return null; // null 값 리턴
        }
        // 음식 우선순위 이름을 저장하는 foodTypes
        const foodTypes = ["rank_koreanfood", "rank_japanesefood", "rank_chinesefood", "rank_westernfood", "rank_fastfood", "rank_meat"];
        let invertedRanks = {}; // 역수 값을 저장

        // 1. 각 rank 값의 역수를 계산 (낮은 rank 일수록 더 많은 음식점을 추천해야 하므로)
        for (let i = 0; i < foodTypes.length; i++) {
            let type = foodTypes[i];

            // 선호도 값이 0보다 클 경우(즉, 선호도 값이 존재하는 경우)역수를 계산, 그렇지 않으면 그대로 0을 할당
            if (user[type] > 0) {
                invertedRanks[type] = 1 / user[type]; // 역수값 저장
            } else {
                invertedRanks[type] = 0;
            }
        }

        let total_weight = 0; // 역수의 총합을 저장하는 변수
        // invertedRanks 객체의 모든 값들을 반복하여 역수의 총합을 구한다.
        for (let type in invertedRanks) {
            total_weight += invertedRanks[type];
        }
        const travel_day = user.travel_day; // 여행일을 저장하는 변수
        const travelCounts = { 1: 3, 2: 6, 3: 9 }; // 여행일에 따른 음식점 갯수(당일치기: 3개, 1박2일: 6개, 2박3일: 9개)

        // 2. rank에 따른 음식점 개수 비율 계산
        let recommendations = {}; // 음식점 갯수를 추천하기 위한 비율을 저장
        for (let i = 0; i < foodTypes.length; i++) {
            let type = foodTypes[i];

            // 해당 유형의 선호도 역수가 0보다 클 경우에만 추천 비율을 계산
            if (invertedRanks[type] > 0) {
                recommendations[type] = (invertedRanks[type] / total_weight) * travelCounts[travel_day];
            }
        }

        // 3. 정수 부분을 기반으로 음식점 개수 계산
        let counts = {}; // 음식점 개수를 저장
        let remainders = []; // 소수점 부분을 저장하는 배열

        for (let i = 0; i < foodTypes.length; i++) {
            let type = foodTypes[i];

            if (recommendations[type]) {
                // 정수 부분을 counts에 저장
                counts[type] = Math.floor(recommendations[type]);
                // 소수점 부분을 remainders에 저장
                remainders.push({ type: type, value: recommendations[type] - counts[type] });
            }
        }

        // 4. 정수부분에서 추천한 음식점 수가 부족한 경우 소수점 부분을 기반으로 추가
        remainders.sort((a, b) => b.value - a.value); // 정렬 함수를 통해, 소수점이 높은 값부터 음식점 추천 갯수를 늘린다.
        let totalCounts = 0; // 정수 부분에서 추천받은 음식점의 수
        for (let type in counts) { // 음식점 수를 다 더하는 for문
            totalCounts += counts[type];
        }
        let remaining = travelCounts[travel_day] - totalCounts; // 남아있는 음식점의 추천 수를 계산

        for (let i = 0; i < remaining; i++) { // 소수점이 큰 값부터 음식점 개수 추가
            if (remainders[i]) {
                counts[remainders[i].type] += 1;
            }
        }

        const keywords = { // 음식점 키워드
            rank_koreanfood: ['한식'],
            rank_japanesefood: ['일식'],
            rank_chinesefood: ['중식'],
            rank_westernfood: ['양식'],
            rank_fastfood: ['패스트푸드'],
            rank_meat: ['구이']
        };

        let result = {}; // 음식점 개수 및 rank를 저장하는 result
        for (let i = 0; i < foodTypes.length; i++) { // 음식점 개수 및 rank 저장
            let type = foodTypes[i];
            result[type] = { count: counts[type], rank: user[type], keywords: keywords[type] };
        }

        return result;
    } catch (error) {
        console.error('음식점 개수 계산 중 오류가 발생했습니다: ', error);
        return null;
    }
}

module.exports = setUserFoodRank; // setUserFoodRank 함수를 모듈로 export