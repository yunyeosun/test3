// 경우의 수(순열)를 계산하는 함수들

// 모든 경우의 수를 계산, 저장하는 배열
function getPermutations(array) {
    let results = []; // 모든 경우의 수를 저장할 배열
    let stack = []; // 현재 상태를 저장할 스택

    stack.push({ index: 0, arr: [] }); // 스택에 초기 상태를 push

    while (stack.length > 0) {
        let { index, arr } = stack.pop();
        if (index === array.length) { // 모든 요소가 순열에 포함되었는지 확인
            results.push(arr); // 모든 요소가 포함되었다면 결과 배열에 순열을 추가하고 계속 진행
            continue;
        }
        for (let i = 0; i < array.length; i++) { // 배열의 각 요소에 대하여
            if (!arr.includes(array[i])) { // 현재 순열에 이미 해당 요소가 포함되어 있지 않은지 확인
                stack.push({ index: index + 1, arr: arr.concat(array[i]) }); // 해당 요소가 포함되어 있지 않다면, 현재 순열에 해당 요소를 추가하고 인덱스(순열 크기) + 1
            }
        }
    }
    return results;
}

// 당일치기일 때 모든 경우의 수를 계산하는 함수
function getAllCombinations1_day1(destinations_seq0, destinations, restaurants) {
    // 모든 가능한 여행지 순열
    const destPermutations = getPermutations(destinations);
    // 모든 가능한 음식점 순열
    const restPermutations = getPermutations(restaurants);
    // 모든 조합을 저장할 배열
    let allCombinations = [];
    // 여행지 순열과 음식점 순열을 결합하여 조합을 생성
    destPermutations.forEach(destPerm => {
        restPermutations.forEach(restPerm => {
            // 여행지-음식점-여행지-음식점... 패턴을 만들 조합
            let combination = [];
            combination.push(destinations_seq0[0]); // 첫 번째에는 버스터미널 값을 저장
            for (let i = 0; i < destPerm.length; i++) {
                combination.push(destPerm[i]);
                if (restPerm[i]) {
                    combination.push(restPerm[i]);
                }
            }
            allCombinations.push(combination);
        });
    });
    return allCombinations;
}

// 1박2일, 2박3일이고, 첫 번째 날의 모든 경우의 수를 계산
function getAllCombinations2or3_day1(destinations_seq0, destinations, restaurants, accommodations) {
    // 모든 가능한 여행지 순열
    const destPermutations = getPermutations(destinations);
    // 모든 가능한 음식점 순열
    const restPermutations = getPermutations(restaurants);
    // 모든 조합을 저장할 배열
    let allCombinations = [];
    // 여행지 순열과 음식점 순열을 결합하여 조합을 생성
    destPermutations.forEach(destPerm => {
        restPermutations.forEach(restPerm => {
            // 여행지-음식점-여행지-음식점... 패턴을 만들 조합
            let combination = [];
            combination.push(destinations_seq0[0]); // 첫 번째는 버스터미널 값을 저장
            for (let i = 0; i < destPerm.length; i++) {
                combination.push(destPerm[i]);
                if (restPerm[i]) {
                    combination.push(restPerm[i]);
                }
            }
            combination.push(accommodations[0]); // 마지막에는 숙박시설 값을 저장
            allCombinations.push(combination);
        });
    });
    return allCombinations;
}

// 1박 2일일 때, 2일차의 모든 경우의 수
function getAllCombinations2_day2(destinations, restaurants) {
    // 모든 가능한 여행지 순열을 가져온다
    const destPermutations = getPermutations(destinations);
    // 모든 가능한 음식점 순열을 가져온다
    const restPermutations = getPermutations(restaurants);
    // 모든 조합을 저장할 배열
    let allCombinations = [];
    // 여행지 순열과 음식점 순열을 결합하여 조합을 생성
    destPermutations.forEach(destPerm => {
        restPermutations.forEach(restPerm => {
            // 여행지-음식점-여행지-음식점... 패턴을 만들 조합
            let combination = [];
            for (let i = 0; i < destPerm.length; i++) {
                combination.push(destPerm[i]);
                if (restPerm[i]) {
                    combination.push(restPerm[i]);
                }
            }
            allCombinations.push(combination);
        });
    });
    return allCombinations;
}

// 2박 3일일 때, 2일차의 모든 경우의 수
function getAllCombinations3_day2(destinations, restaurants, accommodations) {
    // 모든 가능한 여행지 순열을 가져온다
    const destPermutations = getPermutations(destinations);
    // 모든 가능한 음식점 순열을 가져온다
    const restPermutations = getPermutations(restaurants);
    // 모든 조합을 저장할 배열
    let allCombinations = [];
    // 여행지 순열과 음식점 순열을 결합하여 조합을 생성
    destPermutations.forEach(destPerm => {
        restPermutations.forEach(restPerm => {
            // 여행지-음식점-여행지-음식점... 패턴을 만들 조합
            let combination = [];
            for (let i = 0; i < destPerm.length; i++) {
                combination.push(destPerm[i]);
                if (restPerm[i]) {
                    combination.push(restPerm[i]);
                }
            }
            combination.push(accommodations[0]); // 마지막은 숙박 시설을 저장
            allCombinations.push(combination);
        });
    });
    return allCombinations;
}

// 2박 3일일 때, 3일차의 모든 경우의 수
function getAllCombinations3_day3(destinations, restaurants) {
    // 모든 가능한 여행지 순열을 가져온다
    const destPermutations = getPermutations(destinations);
    // 모든 가능한 음식점 순열을 가져온다
    const restPermutations = getPermutations(restaurants);
    // 모든 조합을 저장할 배열
    let allCombinations = [];
    // 여행지 순열과 음식점 순열을 결합하여 조합을 생성
    destPermutations.forEach(destPerm => {
        restPermutations.forEach(restPerm => {
            // 여행지-음식점-여행지-음식점... 패턴을 만들 조합
            let combination = [];
            for (let i = 0; i < destPerm.length; i++) {
                combination.push(destPerm[i]);
                if (restPerm[i]) {
                    combination.push(restPerm[i]);
                }
            }
            allCombinations.push(combination);
        });
    });
    return allCombinations;
}

module.exports = {
    getPermutations,
    getAllCombinations1_day1,
    getAllCombinations2or3_day1,
    getAllCombinations2_day2,
    getAllCombinations3_day2,
    getAllCombinations3_day3
}