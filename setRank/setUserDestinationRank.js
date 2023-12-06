// 사용자의 여행지 우선순위를 바탕으로 여행지 추천 갯수를 계산하는 함수
const Personalities = require('../DB/personalities-definition.js');

async function setUserDestinationRank(userId) {
    try {
        const user = await Personalities.findOne({ user_id: userId }); // 해당 userId의 personalities 데이터를 가져온다.
        if (!user) { // 유저가 존재하지 않는 경우
            return null; // null 값 리턴
        }
        // 여행지 우선순위 이름을 저장하는 destinationTypes
        const destinationTypes = ["rank_mountain", "rank_sea", "rank_historicalTheme", "rank_experienceTheme", "rank_buildingTheme", "rank_cafe"];
        let invertedRanks = {}; // 역수 값을 저장

        // 1. 각 rank 값의 역수를 계산 (낮은 rank 일수록 더 많은 여행지를 추천해야 하므로)
        for (let i = 0; i < destinationTypes.length; i++) {
            let type = destinationTypes[i];

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
        const travelCounts = { 1: 4, 2: 8, 3: 12 }; // 여행일에 따른 여행지 갯수(당일치기: 4개, 1박2일: 8개, 2박3일: 12개)

        // 2. rank에 따른 여행지 비율 계산
        let recommendations = {}; // 여행지 갯수를 추천하기 위한 비율을 저장
        for (let i = 0; i < destinationTypes.length; i++) {
            let type = destinationTypes[i];

            // 해당 유형의 선호도 역수가 0보다 클 경우에만 추천 비율을 계산
            if (invertedRanks[type] > 0) {
                recommendations[type] = (invertedRanks[type] / total_weight) * travelCounts[travel_day];
            }
        }

        // 3. 정수 부분을 기반으로 여행지 개수 계산
        let counts = {}; // 여행지 개수를 저장
        let remainders = []; // 소수점 부분을 저장하는 배열

        for (let i = 0; i < destinationTypes.length; i++) {
            let type = destinationTypes[i];

            if (recommendations[type]) {
                // 정수 부분을 counts에 저장
                counts[type] = Math.floor(recommendations[type]);
                // 소수점 부분을 remainders에 저장
                remainders.push({ type: type, value: recommendations[type] - counts[type] });
            }
        }

        // 4. 정수부분에서 추천한 여행지 수가 부족한 경우 소수점 부분을 기반으로 추가
        remainders.sort((a, b) => b.value - a.value); // 정렬 함수를 통해, 소수점이 높은 값부터 여행지 추천 갯수를 늘린다.
        let totalCounts = 0; // 정수 부분에서 추천받은 여행지의 수
        for (let type in counts) { // 여행지 수를 다 더하는 for문
            totalCounts += counts[type];
        }
        let remaining = travelCounts[travel_day] - totalCounts; // 남아있는 여행지의 추천 수를 계산

        for (let i = 0; i < remaining; i++) { // 소수점이 큰 값부터 여행지 개수 추가
            if (remainders[i]) {
                counts[remainders[i].type] += 1;
            }
        }

        const keywords = { // 여행 키워드
            rank_mountain: ['산 mountain', '국립공원', '수목원', '식물원', '계곡'],
            rank_sea: ['해수욕장'],
            rank_historicalTheme: ['문화유적', '박물관'],
            rank_experienceTheme: ['체험학습장', '체험마을'],
            rank_buildingTheme: ['전망대', '석탑'],
            rank_cafe: ['카페']
        };

        let result = {}; // 여행지 개수 및 rank를 저장하는 result
        for (let i = 0; i < destinationTypes.length; i++) { // 여행지 개수 및 rank, 여행 키워드 저장
            let type = destinationTypes[i];
            result[type] = { count: counts[type], rank: user[type], keywords: keywords[type] };
        }

        return result;
    } catch (error) {
        console.error('여행지 개수 계산 중 오류가 발생했습니다: ', error);
        return null;
    }
}

module.exports = setUserDestinationRank; // setUserDestinationRank 함수를 모듈로 export