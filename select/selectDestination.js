const axios = require('axios'); //json을 받아오기 위함
require('dotenv').config();

const Personalities = require('../DB/personalities-definition.js');
const uri = process.env.uri; // MongoDB Atlas 연결 URI
const setUserDestinationRank = require('../setRank/setUserDestinationRank.js') // 여행지 추천 갯수를 가져오는 모듈
const setUserFoodRank = require('../setRank/setUserFoodRank.js'); // 음식 추천 갯수를 가져오는 모듈
const setUserAccommodationRank = require('../setRank/setUserAccommodationRank.js'); // 숙박시설 추천 갯수를 가져오는 모듈
const googleMapApiKey = process.env.googleMapApiKey;

async function selectDestination(userId) {
    try {
        const user = await Personalities.findOne({ user_id: userId }); // 해당 userId의 personalities 데이터를 가져온다.
        if (!user) { // 유저가 존재하지 않는 경우
            return null; // null 값 리턴
        }
        const travel_day = user.travel_day; // 여행일
        //const travel_day = 3;
        const travel_destination = user.travel_destination;
        // 시작 좌표 설정
        let startpoint_name = travel_destination + "버스터미널"; // 시작좌표 이름(지역 + 버스터미널)
        let startpoint_apiUrl = 'https://maps.googleapis.com/maps/api/place/findplacefromtext/json'; // google api Url
        let startpoint_response = await axios.get(startpoint_apiUrl, { // api 호출
            params: {
                input: startpoint_name,
                inputtype: 'textquery',
                fields: 'formatted_address,geometry/location,photos',
                key: googleMapApiKey,
            }
        })
        const startpoint_places = startpoint_response.data.candidates; // 시작 장소 정보를 가져오는 값
        const startpoint_location = startpoint_places[0].geometry.location; // 시작 위치 위도/경도 정보
        const startpoint_address = startpoint_places[0].formatted_address; // 시작 위치 주소 정보
        let photo_reference = startpoint_places[0].photos[0].photo_reference; // photo_reference 추출
        let photo_apiUrl = `https://maps.googleapis.com/maps/api/place/photo`; // Place Photos API URL
        // 사진 URL 
        let photo_url = `${photo_apiUrl}?maxwidth=400&photoreference=${photo_reference}&key=${googleMapApiKey}`;
        let latitude = startpoint_location.lat // 시작 좌표 위도
        let longitude = startpoint_location.lng // 시작 좌표 경도
        let radius = 5000; // 반경 5km
        const results = []; // 결과를 저장하는 배열
        results.push({
            seq: 0, day: 1, name: startpoint_name, latitude: latitude, longitude: longitude,
            address: startpoint_address, type: "여행지", image_url: photo_url
        });
        //console.log(results[0])
        const user_rankDestinationData = await setUserDestinationRank(userId); // 여행지 추천 갯수를 가져오고, 저장하는 data
        const user_rankFoodData = await setUserFoodRank(userId); // 음식 추천 갯수를 가져오고, 저장하는 data
        const user_rankAccommodationData = await setUserAccommodationRank(userId); // 숙소 추천 갯수를 가져오고, 저장하는 data
        // 여행지, 음식점, 숙소 순서 정렬
        const sortedDestinationKeywords = Object.entries(user_rankDestinationData)
            .filter(([, value]) => value.count > 0)
            .sort((a, b) => a[1].rank - b[1].rank);

        const sortedFoodKeywords = Object.entries(user_rankFoodData)
            .filter(([, value]) => value.count > 0) //count가 0인지 체크
            .sort((a, b) => a[1].rank - b[1].rank); //rank 오름차순으로 정렬

        const sortedAccommodationKeywords = Object.entries(user_rankAccommodationData)
            .filter(([, value]) => value.count > 0) //count가 0인지 체크
            .sort((a, b) => a[1].rank - b[1].rank); //rank 오름차순으로 정렬

        // 여행지 추천 과정 구현
        // travel_day에 따라 나누기(당일치기인지, 1박2일인지, 2박3일인지 분류)

        // 당일치기인 경우
        // seq: 1~4는 당일 여행지
        // seq: 5~7은 당일 음식점
        if (travel_day === 1) {
            let seq_value = 1; // 시퀀스(순서 값)
            let day = 1; // 여행 일차
            // 1. 여행지 4곳 추천
            while (true) {
                for (const [, value] of sortedDestinationKeywords) {
                    if (value.count === 0) {
                        continue; // count가 0인 키워드는 건너뛰기
                    }
                    for (const keyword of value.keywords) {
                        if (value.count === 0) {
                            break; // count가 0이면 종료
                        }
                        let searchvalue = await searchKeyword(latitude, longitude, results, radius, keyword); // 여행지 탐색
                        //console.log('여행지 탐색 시작', keyword)
                        if (searchvalue.length > 0 && searchvalue[0].result_value === 1) { // 여행지 값이 존재하면
                            value.count--; // 해당 여행 카테고리의 count 1 감소
                            results.push({ // 여행지 값 저장
                                seq: seq_value, day: 1, name: searchvalue[0].name, rating: searchvalue[0].rating, latitude: searchvalue[0].latitude,
                                longitude: searchvalue[0].longitude, address: searchvalue[0].address, type: "여행지",
                                place_id: searchvalue[0].place_id, image_url: searchvalue[0].image_url
                            })
                            seq_value = seq_value + 1; // 시퀀스 번호 증가
                            break; // for문 종료
                        }
                        else { // 여행지 값이 존재하지 않으면
                            let else_found = 0
                            while (!else_found) { // 여행지를 찾을 때까지 반복
                                radius = radius + 5000; // 반경 5km 증가
                                searchvalue = await searchKeyword(latitude, longitude, results, radius, keyword); // 여행지 재탐색
                                if (searchvalue.length > 0 && searchvalue[0].result_value === 1) { // 여행지 값이 존재하면
                                    value.count--; // 해당 여행 카테고리의 count 1 감소
                                    results.push({ // 여행지 값 저장
                                        seq: seq_value, day: 1, name: searchvalue[0].name, rating: searchvalue[0].rating, latitude: searchvalue[0].latitude,
                                        longitude: searchvalue[0].longitude, address: searchvalue[0].address, type: "여행지",
                                        place_id: searchvalue[0].place_id, image_url: searchvalue[0].image_url
                                    })
                                    seq_value = seq_value + 1; // 시퀀스 값 증가
                                    radius = 5000; // 여행지 검색 반경을 5km로 다시 복귀
                                    break; // 종료
                                }
                            }
                            break; // for문 종료
                        }
                    }
                }
                if (seq_value === 5) { // 여행지 4곳을 추천했다면,
                    break; // 여행지 추천은 종료 (while문 탈출)
                }
            }
            // 2. 음식점 3곳 추천
            while (true) {
                for (const [, value] of sortedFoodKeywords) {
                    if (value.count === 0) {
                        continue; // count가 0인 키워드는 건너뛰기
                    }
                    for (const keyword of value.keywords) {
                        if (value.count === 0) {
                            break; // count가 0이면 종료
                        }
                        //console.log('음식점 탐색 시작', keyword)
                        let searchvalue = await searchKeyword(latitude, longitude, results, radius, keyword); // 음식점 탐색
                        if (searchvalue.length > 0 && searchvalue[0].result_value === 1) { // 음식점 값을 찾으면
                            value.count--; // 해당 여행 카테고리의 count 1 감소
                            results.push({ // 음식점 값 저장
                                seq: seq_value, day: 1, name: searchvalue[0].name, rating: searchvalue[0].rating, latitude: searchvalue[0].latitude,
                                longitude: searchvalue[0].longitude, address: searchvalue[0].address, type: "음식점",
                                place_id: searchvalue[0].place_id, image_url: searchvalue[0].image_url
                            })
                            seq_value = seq_value + 1; // 시퀀스 값 증가
                            break; // for문 종료
                        }
                        else { // 음식점 값이 존재하지 않으면
                            let else_found = 0
                            while (!else_found) { // 음식점을 찾을 때까지 반복
                                radius = radius + 5000; // 반경 5km 증가
                                searchvalue = await searchKeyword(latitude, longitude, results, radius, keyword);
                                if (searchvalue.length > 0 && searchvalue[0].result_value === 1) { // 음식점 값을 찾으면
                                    value.count--; // 해당 여행 카테고리의 count 1 감소
                                    results.push({ // 음식점 값 저장
                                        seq: seq_value, day: 1, name: searchvalue[0].name, rating: searchvalue[0].rating, latitude: searchvalue[0].latitude,
                                        longitude: searchvalue[0].longitude, address: searchvalue[0].address, type: "음식점",
                                        place_id: searchvalue[0].place_id, image_url: searchvalue[0].image_url
                                    })
                                    seq_value = seq_value + 1; // 시퀀스 값 증가
                                    radius = 5000; // 음식점 검색 반경을 5km로 다시 복귀
                                    break; // 종료
                                }
                            }
                            break; // for문 종료
                        }
                    }
                }
                if (seq_value === 8) { // 음식점 3곳을 추천했다면,
                    break; // 종료
                }
            }
        }
        // 1박2일인 경우
        // seq: 1~4는 1일차 여행지
        // seq: 5~7은 1일차 음식점
        // seq: 8은 1일차 숙소
        // seq: 9~12는 2일차 여행지 (seq:9는 2일차 중심좌표이기도 하다)
        // seq: 13~15는 2일차 음식점
        else if (travel_day === 2) {
            let seq_value = 1; // 시퀀스(순서 값)
            let day = 1; // 여행 일차
            // 1일차 시작
            // 1일차 여행지 4곳 추천
            while (true) {
                for (const [, value] of sortedDestinationKeywords) {
                    if (value.count === 0) {
                        continue; // count가 0인 키워드는 건너뛰기
                    }
                    for (const keyword of value.keywords) {
                        if (value.count === 0) {
                            break; // count가 0이면 종료
                        }
                        //console.log('여행지1 탐색 시작', keyword)
                        let searchvalue = await searchKeyword(latitude, longitude, results, radius, keyword); // 여행지 탐색
                        if (searchvalue.length > 0 && searchvalue[0].result_value === 1) { // 여행지 값이 존재하면
                            value.count--; // 해당 여행 카테고리의 count 1 감소
                            results.push({ // 여행지 값 저장
                                seq: seq_value, day: day, name: searchvalue[0].name, rating: searchvalue[0].rating, latitude: searchvalue[0].latitude,
                                longitude: searchvalue[0].longitude, address: searchvalue[0].address, type: "여행지",
                                place_id: searchvalue[0].place_id, image_url: searchvalue[0].image_url
                            })
                            seq_value = seq_value + 1; // 시퀀스 번호 증가
                            break; // for문 종료
                        }
                        else { // 여행지 값이 존재하지 않으면
                            let else_found = 0
                            while (!else_found) { // 여행지를 찾을 때까지 반복
                                radius = radius + 5000; // 반경 5km 증가
                                searchvalue = await searchKeyword(latitude, longitude, results, radius, keyword); // 여행지 재탐색
                                if (searchvalue.length > 0 && searchvalue[0].result_value === 1) { // 여행지 값이 존재하면
                                    value.count--; // 해당 여행 카테고리의 count 1 감소
                                    results.push({ // 여행지 값 저장
                                        seq: seq_value, day: day, name: searchvalue[0].name, rating: searchvalue[0].rating, latitude: searchvalue[0].latitude,
                                        longitude: searchvalue[0].longitude, address: searchvalue[0].address, type: "여행지",
                                        place_id: searchvalue[0].place_id, image_url: searchvalue[0].image_url
                                    })
                                    seq_value = seq_value + 1; // 시퀀스 값 증가
                                    radius = 5000; // 여행지 검색 반경을 5km로 다시 복귀
                                    break; // 종료
                                }
                            }
                            break; // for문 종료
                        }
                    }
                    if (seq_value === 5) { // 여행지 4곳을 추천했다면,
                        break; // 여행지 추천은 종료 (while문 탈출)
                    }
                }
                if (seq_value === 5) { // 여행지 4곳을 추천했다면,
                    break; // 여행지 추천은 종료 (while문 탈출)
                }
            }
            // 1일차 음식점 3곳 추천
            while (true) {
                for (const [, value] of sortedFoodKeywords) {
                    if (value.count === 0) {
                        continue; // count가 0인 키워드는 건너뛰기
                    }
                    for (const keyword of value.keywords) {
                        if (value.count === 0) {
                            break; // count가 0이면 종료
                        }
                        //console.log('음식점1 탐색 시작', keyword)
                        let searchvalue = await searchKeyword(latitude, longitude, results, radius, keyword); // 음식점 탐색
                        if (searchvalue.length > 0 && searchvalue[0].result_value === 1) { // 음식점 값을 찾으면
                            value.count--; // 해당 여행 카테고리의 count 1 감소
                            results.push({ // 음식점 값 저장
                                seq: seq_value, day: day, name: searchvalue[0].name, rating: searchvalue[0].rating, latitude: searchvalue[0].latitude,
                                longitude: searchvalue[0].longitude, address: searchvalue[0].address, type: "음식점",
                                place_id: searchvalue[0].place_id, image_url: searchvalue[0].image_url
                            })
                            seq_value = seq_value + 1; // 시퀀스 값 증가
                            break; // for문 종료
                        }
                        else { // 음식점 값이 존재하지 않으면
                            let else_found = 0
                            while (!else_found) { // 음식점을 찾을 때까지 반복
                                radius = radius + 5000; // 반경 5km 증가
                                searchvalue = await searchKeyword(latitude, longitude, results, radius, keyword);
                                if (searchvalue.length > 0 && searchvalue[0].result_value === 1) { // 음식점 값을 찾으면
                                    value.count--; // 해당 여행 카테고리의 count 1 감소
                                    results.push({ // 음식점 값 저장
                                        seq: seq_value, day: day, name: searchvalue[0].name, rating: searchvalue[0].rating, latitude: searchvalue[0].latitude,
                                        longitude: searchvalue[0].longitude, address: searchvalue[0].address, type: "음식점",
                                        place_id: searchvalue[0].place_id, image_url: searchvalue[0].image_url
                                    })
                                    seq_value = seq_value + 1; // 시퀀스 값 증가
                                    radius = 5000; // 음식점 검색 반경을 5km로 다시 복귀
                                    break; // 종료
                                }
                            }
                            break; // for문 종료
                        }
                    }
                    if (seq_value === 8) { // 음식점 3곳을 추천했다면,
                        break; // 종료
                    }
                }
                if (seq_value === 8) { // 음식점 3곳을 추천했다면,
                    break; // 종료
                }
            }
            // 1일차 숙소 추천
            while (true) {
                for (const [, value] of sortedAccommodationKeywords) {
                    if (value.count === 0) {
                        continue; // count가 0인 키워드는 건너뛰기
                    }
                    for (const keyword of value.keywords) {
                        if (value.count === 0) {
                            break; // count가 0이면 종료
                        }
                        //console.log('숙소1 탐색 시작', keyword)
                        let searchvalue = await searchKeyword(latitude, longitude, results, radius, keyword); // 숙소 탐색
                        if (searchvalue.length > 0 && searchvalue[0].result_value === 1) { // 숙소 값을 찾으면
                            value.count--; // 해당 숙소 카테고리의 count 1 감소
                            results.push({ // 숙소 값 저장
                                seq: seq_value, day: day, name: searchvalue[0].name, rating: searchvalue[0].rating, latitude: searchvalue[0].latitude,
                                longitude: searchvalue[0].longitude, address: searchvalue[0].address, type: "숙소",
                                place_id: searchvalue[0].place_id, image_url: searchvalue[0].image_url
                            })
                            seq_value = seq_value + 1; // 시퀀스 값 증가
                            break; // for문 종료
                        }
                        else { // 숙소 값이 존재하지 않으면
                            let else_found = 0
                            while (!else_found) { // 숙소를 찾을 때까지 반복
                                radius = radius + 5000; // 반경 5km 증가
                                searchvalue = await searchKeyword(latitude, longitude, results, radius, keyword);
                                if (searchvalue.length > 0 && searchvalue[0].result_value === 1) { // 숙소 값을 찾으면
                                    value.count--; // 해당 숙소 카테고리의 count 1 감소
                                    results.push({ // 숙소 값 저장
                                        seq: seq_value, day: day, name: searchvalue[0].name, rating: searchvalue[0].rating, latitude: searchvalue[0].latitude,
                                        longitude: searchvalue[0].longitude, address: searchvalue[0].address, type: "숙소",
                                        place_id: searchvalue[0].place_id, image_url: searchvalue[0].image_url
                                    })
                                    seq_value = seq_value + 1; // 시퀀스 값 증가
                                    radius = 5000; // 숙소 검색 반경을 5km로 다시 복귀
                                    break; // 종료
                                }
                            }
                            break; // for문 종료
                        }
                    }
                    if (seq_value === 9) { // 숙소 1곳을 추천했다면,
                        break; // 종료
                    }
                }
                if (seq_value === 9) { // 숙소 1곳을 추천했다면,
                    break; // 종료
                }
            }
            day = day + 1; // 1일차 종료, 날짜 하루 증가
            // 1일차 끝
            // 2일차 시작
            // 2일차 여행지 추천
            while (true) {
                for (const [, value] of sortedDestinationKeywords) {
                    if (value.count === 0) {
                        continue; // count가 0인 키워드는 건너뛰기
                    }
                    if (seq_value === 9) { // 2일차 첫 번째 여행지 추천이라면
                        for (const keyword of value.keywords) {
                            //console.log('여행지2-1 탐색 시작', keyword)
                            let searchvalue = await searchKeywordWithLocation(travel_destination, results, radius, keyword); // 여행지 탐색을 지역 명으로 진행
                            if (searchvalue.length > 0 && searchvalue[0].result_value === 1) { // 여행지 값이 존재하면
                                value.count--; // 해당 여행 카테고리의 count 1 감소
                                latitude = searchvalue[0].latitude; // 중심좌표 위도 수정(2번째 날의 첫번째 여행지로)
                                longitude = searchvalue[0].longitude; // 중심좌표 경도 수정(2번째 날의 첫번째 여행지로)
                                results.push({ // 여행지 값 저장
                                    seq: seq_value, day: day, name: searchvalue[0].name, rating: searchvalue[0].rating, latitude: searchvalue[0].latitude,
                                    longitude: searchvalue[0].longitude, address: searchvalue[0].address, type: "여행지",
                                    place_id: searchvalue[0].place_id, image_url: searchvalue[0].image_url
                                })
                                seq_value = seq_value + 1; // 시퀀스 번호 증가
                                break; // for문 종료
                            }
                            else { // 여행지 값이 존재하지 않으면
                                let else_found = 0
                                while (!else_found) { // 여행지를 찾을 때까지 반복
                                    radius = radius + 5000; // 반경 5km 증가
                                    searchvalue = await searchKeywordWithLocation(travel_destination, results, radius, keyword); // 여행지 탐색을 지역 명으로 진행
                                    if (searchvalue.length > 0 && searchvalue[0].result_value === 1) { // 여행지 값이 존재하면
                                        value.count--; // 해당 여행 카테고리의 count 1 감소
                                        latitude = searchvalue[0].latitude; // 중심좌표 위도 수정(2번째 날의 첫번째 여행지로)
                                        longitude = searchvalue[0].longitude; // 중심좌표 경도 수정(2번째 날의 첫번째 여행지로)
                                        results.push({ // 여행지 값 저장
                                            seq: seq_value, day: day, name: searchvalue[0].name, rating: searchvalue[0].rating, latitude: searchvalue[0].latitude,
                                            longitude: searchvalue[0].longitude, address: searchvalue[0].address, type: "여행지",
                                            place_id: searchvalue[0].place_id, image_url: searchvalue[0].image_url
                                        })
                                        seq_value = seq_value + 1; // 시퀀스 값 증가
                                        radius = 5000; // 여행지 검색 반경을 5km로 다시 복귀
                                        else_found = 1; // 종료
                                    }
                                }
                                break; // for문 종료
                            }
                        }
                    }
                    else {
                        for (const keyword of value.keywords) {
                            if (value.count === 0) {
                                break; // count가 0이면 종료
                            }
                            //console.log('여행지2-2 탐색 시작', keyword)
                            let searchvalue = await searchKeyword(latitude, longitude, results, radius, keyword); // 여행지 탐색
                            if (searchvalue.length > 0 && searchvalue[0].result_value === 1) { // 여행지 값이 존재하면
                                value.count--; // 해당 여행 카테고리의 count 1 감소
                                results.push({ // 여행지 값 저장
                                    seq: seq_value, day: day, name: searchvalue[0].name, rating: searchvalue[0].rating, latitude: searchvalue[0].latitude,
                                    longitude: searchvalue[0].longitude, address: searchvalue[0].address, type: "여행지",
                                    place_id: searchvalue[0].place_id, image_url: searchvalue[0].image_url
                                })
                                seq_value = seq_value + 1; // 시퀀스 번호 증가
                                break; // for문 종료
                            }
                            else { // 여행지 값이 존재하지 않으면
                                let else_found = 0
                                while (!else_found) { // 여행지를 찾을 때까지 반복
                                    radius = radius + 5000; // 반경 5km 증가
                                    searchvalue = await searchKeyword(latitude, longitude, results, radius, keyword); // 여행지 재탐색
                                    if (searchvalue.length > 0 && searchvalue[0].result_value === 1) { // 여행지 값이 존재하면
                                        value.count--; // 해당 여행 카테고리의 count 1 감소
                                        results.push({ // 여행지 값 저장
                                            seq: seq_value, day: day, name: searchvalue[0].name, rating: searchvalue[0].rating, latitude: searchvalue[0].latitude,
                                            longitude: searchvalue[0].longitude, address: searchvalue[0].address, type: "여행지",
                                            place_id: searchvalue[0].place_id, image_url: searchvalue[0].image_url
                                        })
                                        seq_value = seq_value + 1; // 시퀀스 값 증가
                                        radius = 5000; // 여행지 검색 반경을 5km로 다시 복귀
                                        break; // 종료
                                    }
                                }
                                break; // for문 종료
                            }
                        }
                    }
                }
                if (seq_value === 13) { // 여행지 4곳을 추천했다면,
                    break; // 여행지 추천은 종료 (while문 탈출)
                }
            }
            // 2일차 음식점 추천
            while (true) {
                for (const [, value] of sortedFoodKeywords) {
                    if (value.count === 0) {
                        continue; // count가 0인 키워드는 건너뛰기
                    }
                    for (const keyword of value.keywords) {
                        if (value.count === 0) {
                            break; // count가 0이면 종료
                        }
                        //console.log('음식점2 탐색 시작', keyword)
                        let searchvalue = await searchKeyword(latitude, longitude, results, radius, keyword); // 음식점 탐색
                        if (searchvalue.length > 0 && searchvalue[0].result_value === 1) { // 음식점 값을 찾으면
                            value.count--; // 해당 여행 카테고리의 count 1 감소
                            results.push({ // 음식점 값 저장
                                seq: seq_value, day: day, name: searchvalue[0].name, rating: searchvalue[0].rating, latitude: searchvalue[0].latitude,
                                longitude: searchvalue[0].longitude, address: searchvalue[0].address, type: "음식점",
                                place_id: searchvalue[0].place_id, image_url: searchvalue[0].image_url
                            })
                            seq_value = seq_value + 1; // 시퀀스 값 증가
                            break; // for문 종료
                        }
                        else { // 음식점 값이 존재하지 않으면
                            let else_found = 0
                            while (!else_found) { // 음식점을 찾을 때까지 반복
                                radius = radius + 5000; // 반경 5km 증가
                                searchvalue = await searchKeyword(latitude, longitude, results, radius, keyword);
                                if (searchvalue.length > 0 && searchvalue[0].result_value === 1) { // 음식점 값을 찾으면
                                    value.count--; // 해당 여행 카테고리의 count 1 감소
                                    results.push({ // 음식점 값 저장
                                        seq: seq_value, day: day, name: searchvalue[0].name, rating: searchvalue[0].rating, latitude: searchvalue[0].latitude,
                                        longitude: searchvalue[0].longitude, address: searchvalue[0].address, type: "음식점",
                                        place_id: searchvalue[0].place_id, image_url: searchvalue[0].image_url
                                    })
                                    seq_value = seq_value + 1; // 시퀀스 값 증가
                                    radius = 5000; // 음식점 검색 반경을 5km로 다시 복귀
                                    break; // 종료
                                }
                            }
                            break; // for문 종료
                        }
                    }
                }
                if (seq_value === 16) { // 음식점 3곳을 추천했다면,
                    break; // 종료
                }
            }
        }
        // 2박3일인 경우
        // seq: 1~4는 1일차 여행지
        // seq: 5~7은 1일차 음식점
        // seq: 8은 1일차 숙소
        // seq: 9~12는 2일차 여행지 (seq:9는 2일차 중심좌표이기도 하다)
        // seq: 13~15는 2일차 음식점
        // seq: 16은 2일차 숙소
        // seq: 17~20은 3일차 여행지 (seq:17은 3일차 중심좌표이기도 하다)
        // seqL 21~23은 3일차 음식점
        else if (travel_day === 3) {
            let seq_value = 1; // 시퀀스(순서 값)
            let day = 1; // 여행 일차
            // 1일차 시작
            // 1일차 여행지 4곳 추천
            while (true) {
                for (const [, value] of sortedDestinationKeywords) {
                    if (value.count === 0) {
                        continue; // count가 0인 키워드는 건너뛰기
                    }
                    for (const keyword of value.keywords) {
                        if (value.count === 0) {
                            break; // count가 0이면 종료
                        }
                        //console.log('여행지1 탐색 시작', keyword)
                        let searchvalue = await searchKeyword(latitude, longitude, results, radius, keyword); // 여행지 탐색
                        if (searchvalue.length > 0 && searchvalue[0].result_value === 1) { // 여행지 값이 존재하면
                            value.count--; // 해당 여행 카테고리의 count 1 감소
                            results.push({ // 여행지 값 저장
                                seq: seq_value, day: day, name: searchvalue[0].name, rating: searchvalue[0].rating, latitude: searchvalue[0].latitude,
                                longitude: searchvalue[0].longitude, address: searchvalue[0].address, type: "여행지",
                                place_id: searchvalue[0].place_id, image_url: searchvalue[0].image_url
                            })
                            seq_value = seq_value + 1; // 시퀀스 번호 증가
                            break; // for문 종료
                        }
                        else { // 여행지 값이 존재하지 않으면
                            let else_found = 0
                            while (!else_found) { // 여행지를 찾을 때까지 반복
                                radius = radius + 5000; // 반경 5km 증가
                                searchvalue = await searchKeyword(latitude, longitude, results, radius, keyword); // 여행지 재탐색
                                if (searchvalue.length > 0 && searchvalue[0].result_value === 1) { // 여행지 값이 존재하면
                                    value.count--; // 해당 여행 카테고리의 count 1 감소
                                    results.push({ // 여행지 값 저장
                                        seq: seq_value, day: day, name: searchvalue[0].name, rating: searchvalue[0].rating, latitude: searchvalue[0].latitude,
                                        longitude: searchvalue[0].longitude, address: searchvalue[0].address, type: "여행지",
                                        place_id: searchvalue[0].place_id, image_url: searchvalue[0].image_url
                                    })
                                    seq_value = seq_value + 1; // 시퀀스 값 증가
                                    radius = 5000; // 여행지 검색 반경을 5km로 다시 복귀
                                    break; // 종료
                                }
                            }
                            break; // for문 종료
                        }
                    }
                    if (seq_value === 5) { // 여행지 4곳을 추천했다면,
                        break; // 여행지 추천은 종료 (while문 탈출)
                    }
                }
                if (seq_value === 5) { // 여행지 4곳을 추천했다면,
                    break; // 여행지 추천은 종료 (while문 탈출)
                }
            }
            // 1일차 음식점 3곳 추천
            while (true) {
                for (const [, value] of sortedFoodKeywords) {
                    if (value.count === 0) {
                        continue; // count가 0인 키워드는 건너뛰기
                    }
                    for (const keyword of value.keywords) {
                        if (value.count === 0) {
                            break; // count가 0이면 종료
                        }
                        //console.log('음식점1 탐색 시작', keyword)
                        let searchvalue = await searchKeyword(latitude, longitude, results, radius, keyword); // 음식점 탐색
                        if (searchvalue.length > 0 && searchvalue[0].result_value === 1) { // 음식점 값을 찾으면
                            value.count--; // 해당 여행 카테고리의 count 1 감소
                            results.push({ // 음식점 값 저장
                                seq: seq_value, day: day, name: searchvalue[0].name, rating: searchvalue[0].rating, latitude: searchvalue[0].latitude,
                                longitude: searchvalue[0].longitude, address: searchvalue[0].address, type: "음식점",
                                place_id: searchvalue[0].place_id, image_url: searchvalue[0].image_url
                            })
                            seq_value = seq_value + 1; // 시퀀스 값 증가
                            break; // for문 종료
                        }
                        else { // 음식점 값이 존재하지 않으면
                            let else_found = 0
                            while (!else_found) { // 음식점을 찾을 때까지 반복
                                radius = radius + 5000; // 반경 5km 증가
                                searchvalue = await searchKeyword(latitude, longitude, results, radius, keyword);
                                if (searchvalue.length > 0 && searchvalue[0].result_value === 1) { // 음식점 값을 찾으면
                                    value.count--; // 해당 여행 카테고리의 count 1 감소
                                    results.push({ // 음식점 값 저장
                                        seq: seq_value, day: day, name: searchvalue[0].name, rating: searchvalue[0].rating, latitude: searchvalue[0].latitude,
                                        longitude: searchvalue[0].longitude, address: searchvalue[0].address, type: "음식점",
                                        place_id: searchvalue[0].place_id, image_url: searchvalue[0].image_url
                                    })
                                    seq_value = seq_value + 1; // 시퀀스 값 증가
                                    radius = 5000; // 음식점 검색 반경을 5km로 다시 복귀
                                    break; // 종료
                                }
                            }
                            break; // for문 종료
                        }
                    }
                    if (seq_value === 8) { // 음식점 3곳을 추천했다면,
                        break; // 종료
                    }
                }
                if (seq_value === 8) { // 음식점 3곳을 추천했다면,
                    break; // 종료
                }
            }
            // 1일차 숙소 추천
            while (true) {
                for (const [, value] of sortedAccommodationKeywords) {
                    if (value.count === 0) {
                        continue; // count가 0인 키워드는 건너뛰기
                    }
                    for (const keyword of value.keywords) {
                        if (value.count === 0) {
                            break; // count가 0이면 종료
                        }
                        //console.log('숙소1 탐색 시작', keyword)
                        let searchvalue = await searchKeyword(latitude, longitude, results, radius, keyword); // 숙소 탐색
                        if (searchvalue.length > 0 && searchvalue[0].result_value === 1) { // 숙소 값을 찾으면
                            value.count--; // 해당 숙소 카테고리의 count 1 감소
                            results.push({ // 숙소 값 저장
                                seq: seq_value, day: day, name: searchvalue[0].name, rating: searchvalue[0].rating, latitude: searchvalue[0].latitude,
                                longitude: searchvalue[0].longitude, address: searchvalue[0].address, type: "숙소",
                                place_id: searchvalue[0].place_id, image_url: searchvalue[0].image_url
                            })
                            seq_value = seq_value + 1; // 시퀀스 값 증가
                            break; // for문 종료
                        }
                        else { // 숙소 값이 존재하지 않으면
                            let else_found = 0
                            while (!else_found) { // 숙소를 찾을 때까지 반복
                                radius = radius + 5000; // 반경 5km 증가
                                searchvalue = await searchKeyword(latitude, longitude, results, radius, keyword);
                                if (searchvalue.length > 0 && searchvalue[0].result_value === 1) { // 숙소 값을 찾으면
                                    value.count--; // 해당 숙소 카테고리의 count 1 감소
                                    results.push({ // 숙소 값 저장
                                        seq: seq_value, day: day, name: searchvalue[0].name, rating: searchvalue[0].rating, latitude: searchvalue[0].latitude,
                                        longitude: searchvalue[0].longitude, address: searchvalue[0].address, type: "숙소",
                                        place_id: searchvalue[0].place_id, image_url: searchvalue[0].image_url
                                    })
                                    seq_value = seq_value + 1; // 시퀀스 값 증가
                                    radius = 5000; // 숙소 검색 반경을 5km로 다시 복귀
                                    break; // 종료
                                }
                            }
                            break; // for문 종료
                        }
                    }
                    if (seq_value === 9) { // 숙소 1곳을 추천했다면,
                        break; // 종료
                    }
                }
                if (seq_value === 9) { // 숙소 1곳을 추천했다면,
                    break; // 종료
                }
            }
            day = day + 1; // 1일차 종료, 날짜 하루 증가
            // 1일차 끝
            // 2일차 시작
            // 2일차 여행지 추천
            while (true) {
                for (const [, value] of sortedDestinationKeywords) {
                    if (value.count === 0) {
                        continue; // count가 0인 키워드는 건너뛰기
                    }
                    if (seq_value === 9) { // 2일차 첫 번째 여행지 추천이라면
                        for (const keyword of value.keywords) {
                            //console.log('여행지2-1 탐색 시작', keyword)
                            let searchvalue = await searchKeywordWithLocation(travel_destination, results, radius, keyword); // 여행지 탐색을 지역 명으로 진행
                            if (searchvalue.length > 0 && searchvalue[0].result_value === 1) { // 여행지 값이 존재하면
                                value.count--; // 해당 여행 카테고리의 count 1 감소
                                latitude = searchvalue[0].latitude; // 중심좌표 위도 수정(2번째 날의 첫번째 여행지로)
                                longitude = searchvalue[0].longitude; // 중심좌표 경도 수정(2번째 날의 첫번째 여행지로)
                                results.push({ // 여행지 값 저장
                                    seq: seq_value, day: day, name: searchvalue[0].name, rating: searchvalue[0].rating, latitude: searchvalue[0].latitude,
                                    longitude: searchvalue[0].longitude, address: searchvalue[0].address, type: "여행지",
                                    place_id: searchvalue[0].place_id, image_url: searchvalue[0].image_url
                                })
                                seq_value = seq_value + 1; // 시퀀스 번호 증가
                                break; // for문 종료
                            }
                            else { // 여행지 값이 존재하지 않으면
                                let else_found = 0
                                while (!else_found) { // 여행지를 찾을 때까지 반복
                                    radius = radius + 5000; // 반경 5km 증가
                                    searchvalue = await searchKeywordWithLocation(travel_destination, results, radius, keyword); // 여행지 탐색을 지역 명으로 진행
                                    if (searchvalue.length > 0 && searchvalue[0].result_value === 1) { // 여행지 값이 존재하면
                                        value.count--; // 해당 여행 카테고리의 count 1 감소
                                        latitude = searchvalue[0].latitude; // 중심좌표 위도 수정(2번째 날의 첫번째 여행지로)
                                        longitude = searchvalue[0].longitude; // 중심좌표 경도 수정(2번째 날의 첫번째 여행지로)
                                        results.push({ // 여행지 값 저장
                                            seq: seq_value, day: day, name: searchvalue[0].name, rating: searchvalue[0].rating, latitude: searchvalue[0].latitude,
                                            longitude: searchvalue[0].longitude, address: searchvalue[0].address, type: "여행지",
                                            place_id: searchvalue[0].place_id, image_url: searchvalue[0].image_url
                                        })
                                        seq_value = seq_value + 1; // 시퀀스 값 증가
                                        radius = 5000; // 여행지 검색 반경을 5km로 다시 복귀
                                        else_found = 1; // 종료
                                    }
                                }
                                break; // for문 종료
                            }
                        }
                    }
                    else {
                        for (const keyword of value.keywords) {
                            if (value.count === 0) {
                                break; // count가 0이면 종료
                            }
                            //console.log('여행지2-2 탐색 시작', keyword)
                            let searchvalue = await searchKeyword(latitude, longitude, results, radius, keyword); // 여행지 탐색
                            if (searchvalue.length > 0 && searchvalue[0].result_value === 1) { // 여행지 값이 존재하면
                                value.count--; // 해당 여행 카테고리의 count 1 감소
                                results.push({ // 여행지 값 저장
                                    seq: seq_value, day: day, name: searchvalue[0].name, rating: searchvalue[0].rating, latitude: searchvalue[0].latitude,
                                    longitude: searchvalue[0].longitude, address: searchvalue[0].address, type: "여행지",
                                    place_id: searchvalue[0].place_id, image_url: searchvalue[0].image_url
                                })
                                seq_value = seq_value + 1; // 시퀀스 번호 증가
                                break; // for문 종료
                            }
                            else { // 여행지 값이 존재하지 않으면
                                let else_found = 0
                                while (!else_found) { // 여행지를 찾을 때까지 반복
                                    radius = radius + 5000; // 반경 5km 증가
                                    searchvalue = await searchKeyword(latitude, longitude, results, radius, keyword); // 여행지 재탐색
                                    if (searchvalue.length > 0 && searchvalue[0].result_value === 1) { // 여행지 값이 존재하면
                                        value.count--; // 해당 여행 카테고리의 count 1 감소
                                        results.push({ // 여행지 값 저장
                                            seq: seq_value, day: day, name: searchvalue[0].name, rating: searchvalue[0].rating, latitude: searchvalue[0].latitude,
                                            longitude: searchvalue[0].longitude, address: searchvalue[0].address, type: "여행지",
                                            place_id: searchvalue[0].place_id, image_url: searchvalue[0].image_url
                                        })
                                        seq_value = seq_value + 1; // 시퀀스 값 증가
                                        radius = 5000; // 여행지 검색 반경을 5km로 다시 복귀
                                        break; // 종료
                                    }
                                }
                                break; // for문 종료
                            }
                        }
                    }
                    if (seq_value === 13) { // 여행지 4곳을 추천했다면,
                        break; // 여행지 추천은 종료 (while문 탈출)
                    }
                }
                if (seq_value === 13) { // 여행지 4곳을 추천했다면,
                    break; // 여행지 추천은 종료 (while문 탈출)
                }
            }
            // 2일차 음식점 추천
            while (true) {
                for (const [, value] of sortedFoodKeywords) {
                    if (value.count === 0) {
                        continue; // count가 0인 키워드는 건너뛰기
                    }
                    for (const keyword of value.keywords) {
                        if (value.count === 0) {
                            break; // count가 0이면 종료
                        }
                        //console.log('음식점2 탐색 시작', keyword)
                        let searchvalue = await searchKeyword(latitude, longitude, results, radius, keyword); // 음식점 탐색
                        if (searchvalue.length > 0 && searchvalue[0].result_value === 1) { // 음식점 값을 찾으면
                            value.count--; // 해당 여행 카테고리의 count 1 감소
                            results.push({ // 음식점 값 저장
                                seq: seq_value, day: day, name: searchvalue[0].name, rating: searchvalue[0].rating, latitude: searchvalue[0].latitude,
                                longitude: searchvalue[0].longitude, address: searchvalue[0].address, type: "음식점",
                                place_id: searchvalue[0].place_id, image_url: searchvalue[0].image_url
                            })
                            seq_value = seq_value + 1; // 시퀀스 값 증가
                            break; // for문 종료
                        }
                        else { // 음식점 값이 존재하지 않으면
                            let else_found = 0
                            while (!else_found) { // 음식점을 찾을 때까지 반복
                                radius = radius + 5000; // 반경 5km 증가
                                searchvalue = await searchKeyword(latitude, longitude, results, radius, keyword);
                                if (searchvalue.length > 0 && searchvalue[0].result_value === 1) { // 음식점 값을 찾으면
                                    value.count--; // 해당 여행 카테고리의 count 1 감소
                                    results.push({ // 음식점 값 저장
                                        seq: seq_value, day: day, name: searchvalue[0].name, rating: searchvalue[0].rating, latitude: searchvalue[0].latitude,
                                        longitude: searchvalue[0].longitude, address: searchvalue[0].address, type: "음식점",
                                        place_id: searchvalue[0].place_id, image_url: searchvalue[0].image_url
                                    })
                                    seq_value = seq_value + 1; // 시퀀스 값 증가
                                    radius = 5000; // 음식점 검색 반경을 5km로 다시 복귀
                                    break; // 종료
                                }
                            }
                            break; // for문 종료
                        }
                    }
                    if (seq_value === 16) { // 음식점 3곳을 추천했다면,
                        break; // 종료
                    }
                }
                if (seq_value === 16) { // 음식점 3곳을 추천했다면,
                    break; // 종료
                }
            }
            // 2일차 숙소 추천
            while (true) {
                for (const [, value] of sortedAccommodationKeywords) {
                    if (value.count === 0) {
                        continue; // count가 0인 키워드는 건너뛰기
                    }
                    for (const keyword of value.keywords) {
                        if (value.count === 0) {
                            break; // count가 0이면 종료
                        }
                        //console.log('숙소2 탐색 시작', keyword)
                        let searchvalue = await searchKeyword(latitude, longitude, results, radius, keyword); // 숙소 탐색
                        if (searchvalue.length > 0 && searchvalue[0].result_value === 1) { // 숙소 값을 찾으면
                            value.count--; // 해당 숙소 카테고리의 count 1 감소
                            results.push({ // 숙소 값 저장
                                seq: seq_value, day: day, name: searchvalue[0].name, rating: searchvalue[0].rating, latitude: searchvalue[0].latitude,
                                longitude: searchvalue[0].longitude, address: searchvalue[0].address, type: "숙소",
                                place_id: searchvalue[0].place_id, image_url: searchvalue[0].image_url
                            })
                            seq_value = seq_value + 1; // 시퀀스 값 증가
                            break; // for문 종료
                        }
                        else { // 숙소 값이 존재하지 않으면
                            let else_found = 0
                            while (!else_found) { // 숙소를 찾을 때까지 반복
                                radius = radius + 5000; // 반경 5km 증가
                                searchvalue = await searchKeyword(latitude, longitude, results, radius, keyword);
                                if (searchvalue.length > 0 && searchvalue[0].result_value === 1) { // 숙소 값을 찾으면
                                    value.count--; // 해당 숙소 카테고리의 count 1 감소
                                    results.push({ // 숙소 값 저장
                                        seq: seq_value, day: day, name: searchvalue[0].name, rating: searchvalue[0].rating, latitude: searchvalue[0].latitude,
                                        longitude: searchvalue[0].longitude, address: searchvalue[0].address, type: "숙소",
                                        place_id: searchvalue[0].place_id, image_url: searchvalue[0].image_url
                                    })
                                    seq_value = seq_value + 1; // 시퀀스 값 증가
                                    radius = 5000; // 숙소 검색 반경을 5km로 다시 복귀
                                    break; // 종료
                                }
                            }
                            break; // for문 종료
                        }
                    }
                    if (seq_value === 17) { // 숙소 1곳을 추천했다면,
                        break; // 종료
                    }
                }
                if (seq_value === 17) { // 숙소 1곳을 추천했다면,
                    break; // 종료
                }
            }
            day = day + 1; // 3일차
            // 3일차 시작
            // 3일차 여행지 추천
            // 2일차 여행지 추천
            while (true) {
                for (const [, value] of sortedDestinationKeywords) {
                    if (value.count === 0) {
                        continue; // count가 0인 키워드는 건너뛰기
                    }
                    if (seq_value === 17) { // 2일차 첫 번째 여행지 추천이라면
                        for (const keyword of value.keywords) {
                            //console.log('여행지3-1 탐색 시작', keyword)
                            let searchvalue = await searchKeywordWithLocation(travel_destination, results, radius, keyword); // 여행지 탐색을 지역 명으로 진행
                            if (searchvalue.length > 0 && searchvalue[0].result_value === 1) { // 여행지 값이 존재하면
                                value.count--; // 해당 여행 카테고리의 count 1 감소
                                latitude = searchvalue[0].latitude; // 중심좌표 위도 수정(2번째 날의 첫번째 여행지로)
                                longitude = searchvalue[0].longitude; // 중심좌표 경도 수정(2번째 날의 첫번째 여행지로)
                                results.push({ // 여행지 값 저장
                                    seq: seq_value, day: day, name: searchvalue[0].name, rating: searchvalue[0].rating, latitude: searchvalue[0].latitude,
                                    longitude: searchvalue[0].longitude, address: searchvalue[0].address, type: "여행지",
                                    place_id: searchvalue[0].place_id, image_url: searchvalue[0].image_url
                                })
                                seq_value = seq_value + 1; // 시퀀스 번호 증가
                                break; // for문 종료
                            }
                            else { // 여행지 값이 존재하지 않으면
                                let else_found = 0
                                while (!else_found) { // 여행지를 찾을 때까지 반복
                                    radius = radius + 5000; // 반경 5km 증가
                                    searchvalue = await searchKeywordWithLocation(travel_destination, results, radius, keyword); // 여행지 탐색을 지역 명으로 진행
                                    if (searchvalue.length > 0 && searchvalue[0].result_value === 1) { // 여행지 값이 존재하면
                                        value.count--; // 해당 여행 카테고리의 count 1 감소
                                        latitude = searchvalue[0].latitude; // 중심좌표 위도 수정(2번째 날의 첫번째 여행지로)
                                        longitude = searchvalue[0].longitude; // 중심좌표 경도 수정(2번째 날의 첫번째 여행지로)
                                        results.push({ // 여행지 값 저장
                                            seq: seq_value, day: day, name: searchvalue[0].name, rating: searchvalue[0].rating, latitude: searchvalue[0].latitude,
                                            longitude: searchvalue[0].longitude, address: searchvalue[0].address, type: "여행지",
                                            place_id: searchvalue[0].place_id, image_url: searchvalue[0].image_url
                                        })
                                        seq_value = seq_value + 1; // 시퀀스 값 증가
                                        radius = 5000; // 여행지 검색 반경을 5km로 다시 복귀
                                        else_found = 1; // 종료
                                    }
                                }
                                break; // for문 종료
                            }
                        }
                    }
                    else {
                        for (const keyword of value.keywords) {
                            if (value.count === 0) {
                                break; // count가 0이면 종료
                            }
                            //console.log('여행지3-2 탐색 시작', keyword)
                            let searchvalue = await searchKeyword(latitude, longitude, results, radius, keyword); // 여행지 탐색
                            if (searchvalue.length > 0 && searchvalue[0].result_value === 1) { // 여행지 값이 존재하면
                                value.count--; // 해당 여행 카테고리의 count 1 감소
                                results.push({ // 여행지 값 저장
                                    seq: seq_value, day: day, name: searchvalue[0].name, rating: searchvalue[0].rating, latitude: searchvalue[0].latitude,
                                    longitude: searchvalue[0].longitude, address: searchvalue[0].address, type: "여행지",
                                    place_id: searchvalue[0].place_id, image_url: searchvalue[0].image_url
                                })
                                seq_value = seq_value + 1; // 시퀀스 번호 증가
                                break; // for문 종료
                            }
                            else { // 여행지 값이 존재하지 않으면
                                let else_found = 0
                                while (!else_found) { // 여행지를 찾을 때까지 반복
                                    radius = radius + 5000; // 반경 5km 증가
                                    searchvalue = await searchKeyword(latitude, longitude, results, radius, keyword); // 여행지 재탐색
                                    if (searchvalue.length > 0 && searchvalue[0].result_value === 1) { // 여행지 값이 존재하면
                                        value.count--; // 해당 여행 카테고리의 count 1 감소
                                        results.push({ // 여행지 값 저장
                                            seq: seq_value, day: day, name: searchvalue[0].name, rating: searchvalue[0].rating, latitude: searchvalue[0].latitude,
                                            longitude: searchvalue[0].longitude, address: searchvalue[0].address, type: "여행지",
                                            place_id: searchvalue[0].place_id, image_url: searchvalue[0].image_url
                                        })
                                        seq_value = seq_value + 1; // 시퀀스 값 증가
                                        radius = 5000; // 여행지 검색 반경을 5km로 다시 복귀
                                        break; // 종료
                                    }
                                }
                                break; // for문 종료
                            }
                        }
                    }
                    if (seq_value === 21) { // 여행지 4곳을 추천했다면,
                        break; // 여행지 추천은 종료 (while문 탈출)
                    }
                }
                if (seq_value === 21) { // 여행지 4곳을 추천했다면,
                    break; // 여행지 추천은 종료 (while문 탈출)
                }
            }
            // 2일차 음식점 추천
            while (true) {
                for (const [, value] of sortedFoodKeywords) {
                    if (value.count === 0) {
                        continue; // count가 0인 키워드는 건너뛰기
                    }
                    for (const keyword of value.keywords) {
                        if (value.count === 0) {
                            break; // count가 0이면 종료
                        }
                        //console.log('음식점3 탐색 시작', keyword)
                        let searchvalue = await searchKeyword(latitude, longitude, results, radius, keyword); // 음식점 탐색
                        if (searchvalue.length > 0 && searchvalue[0].result_value === 1) { // 음식점 값을 찾으면
                            value.count--; // 해당 여행 카테고리의 count 1 감소
                            results.push({ // 음식점 값 저장
                                seq: seq_value, day: day, name: searchvalue[0].name, rating: searchvalue[0].rating, latitude: searchvalue[0].latitude,
                                longitude: searchvalue[0].longitude, address: searchvalue[0].address, type: "음식점",
                                place_id: searchvalue[0].place_id, image_url: searchvalue[0].image_url
                            })
                            seq_value = seq_value + 1; // 시퀀스 값 증가
                            break; // for문 종료
                        }
                        else { // 음식점 값이 존재하지 않으면
                            let else_found = 0
                            while (!else_found) { // 음식점을 찾을 때까지 반복
                                radius = radius + 5000; // 반경 5km 증가
                                searchvalue = await searchKeyword(latitude, longitude, results, radius, keyword);
                                if (searchvalue.length > 0 && searchvalue[0].result_value === 1) { // 음식점 값을 찾으면
                                    value.count--; // 해당 여행 카테고리의 count 1 감소
                                    results.push({ // 음식점 값 저장
                                        seq: seq_value, day: day, name: searchvalue[0].name, rating: searchvalue[0].rating, latitude: searchvalue[0].latitude,
                                        longitude: searchvalue[0].longitude, address: searchvalue[0].address, type: "음식점",
                                        place_id: searchvalue[0].place_id, image_url: searchvalue[0].image_url
                                    })
                                    seq_value = seq_value + 1; // 시퀀스 값 증가
                                    radius = 5000; // 음식점 검색 반경을 5km로 다시 복귀
                                    break; // 종료
                                }
                            }
                            break; // for문 종료
                        }
                    }
                    if (seq_value === 24) { // 음식점 3곳을 추천했다면,
                        break; // 종료
                    }
                }
                if (seq_value === 24) { // 음식점 3곳을 추천했다면,
                    break; // 종료
                }
            }
        }
        //console.log("여행지 추천이 모두 완료되었습니다.");
        return results;
    }
    catch (error) {
        console.error('여행지 추천 중 오류가 발생했습니다: ', error);
        return null;
    }
}

// 특정 키워드에 대한 검색 함수
async function searchKeyword(latitude, longitude, result, radius, keyword) {
    const apiUrl = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${latitude},${longitude}&radius=${radius}&keyword=${keyword}&key=${googleMapApiKey}`;
    let result_list = [];
    try {
        const response = await axios.get(apiUrl, {
            headers: {
                'Accept-Language': 'ko'
            }
        });
        const data = response.data;
        // place_id가 이미 results 배열에 있는지 확인
        if (data.results.length > 0) {
            for (const place of data.results) {
                const rating = place.rating || 0;
                // place_id가 이미 result 배열에 있는지 확인
                if (rating >= 1 && !result.find(result => (result.place_id === place.place_id) && (result.name === place.name))) {
                    let imageUrl = '';
                    // Fetching image for the place
                    if (place.photos && place.photos.length > 0) {
                        const photoReference = place.photos[0].photo_reference;
                        const maxwidth = 400; // Set the desired maximum width of the image
                        imageUrl = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=${maxwidth}&photoreference=${photoReference}&key=${googleMapApiKey}`;
                    }
                    // Storing place details along with image URL
                    result_list.push({
                        result_value: 1,
                        name: place.name,
                        rating: place.rating,
                        latitude: place.geometry.location.lat,
                        longitude: place.geometry.location.lng,
                        address: place.vicinity,
                        place_id: place.place_id,
                        image_url: imageUrl // Adding image URL
                    });
                    return result_list;
                }
            }
        }
        else {
            //console.log(`${keyword} 목적지 검색 결과가 없습니다.`);
            result_list.push({
                result_value: 0
            })
        }
    } catch (error) {
        //console.error(`에러 발생: ${error.message}`);
        result_list.push({
            result_value: 0
        })
    }
    return result_list;
}

// 지역 이름과 키워드가 주어질 때 장소를 검색하는 함수이자, 2-3일차에서 중심좌표를 변경해주는 함수
async function searchKeywordWithLocation(locationName, result, radius, keyword) {
    let result_list = [];
    try {
        // 지역 이름을 기반으로 위치 좌표를 검색
        const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${locationName}&key=${googleMapApiKey}`;
        const geoResponse = await axios.get(geocodeUrl);
        const location = geoResponse.data.results[0].geometry.location;

        // 좌표와 키워드를 사용하여 장소를 검색
        const placesUrl = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${location.lat},${location.lng}&radius=${radius}&keyword=${keyword}&key=${googleMapApiKey}&language=ko`;
        const placesResponse = await axios.get(placesUrl);
        const places = placesResponse.data.results;
        if (places.length > 0) {
            for (const place of places) {
                const rating = place.rating || 0;
                // place_id가 이미 result 배열에 있는지 확인
                if (rating >= 1 && !result.find(result => result.place_id === place.place_id)) {
                    let photo_url = '';
                    if (place.photos && place.photos.length > 0) {
                        const photo_reference = place.photos[0].photo_reference;
                        // 사진 URL 생성
                        photo_url = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${photo_reference}&key=${googleMapApiKey}`;
                    }
                    // 결과 배열에 장소 이름, 별점, 위도, 경도, 주소, 그리고 place_id 저장
                    result_list.push({
                        result_value: 1,
                        name: place.name,
                        rating: place.rating,
                        latitude: place.geometry.location.lat,
                        longitude: place.geometry.location.lng,
                        address: place.vicinity,
                        place_id: place.place_id,
                        image_url: photo_url
                    });
                    return result_list;
                }
            }
        } else {
            result_list.push({
                result_value: 0
            });
        }
    } catch (error) {
        result_list.push({
            result_value: 0
        });
        //console.error(`에러 발생: ${error.message}`);
    }
    return result_list;
}

module.exports = selectDestination;