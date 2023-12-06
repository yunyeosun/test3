// routes 컬렉션 데이터 조회(read)
const Edits = require('../DB/edits-definition');

async function readEdit(req, res) { // 비동기적 동작
    const city = req.params.edit_city; // 요청에서 user_id 파라미터를 가져오기

    try {
        const edits = await Edits.find({ edit_city: city }); // user_id를 사용하여 Routes 컬렉션에서 데이터 조회
        if (edits.length === 0) { // 만약 결과가 없다면, 404 상태 코드와 함께 메시지를 응답
            return res.status(404).json({ message: "저장된 데이터가 없습니다" });
        }
        const data = [];
        for (const info of edits) {
            const user_info = {
                name: info.edit_name, // 이름
                rating: info.edit_rating, // 별점
                address: info.edit_address, // 주소
                location: info.route_location, // 위치(위도와 경도)
                type: info.edit_type, // 여행지/음식점/숙소를 나타내는 타입
                category: info.edit_category // 카테고리(여행지-산, 국립공원 등)
            }
            data.push(user_info)
        }
        res.json(data); // 조회된 데이터를 JSON 형태로 응답
    } catch (error) { // 에러가 발생한 경우, 500 상태 코드와 함께 에러 메시지를 응답
        res.status(500).json({ message: error.message }); // 500: 서버 에러를 총칭하는 에러 코드
    }
}

module.exports = readEdit; // readEdit 함수를 모듈로 export