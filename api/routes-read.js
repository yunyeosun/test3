// routes 컬렉션 데이터 조회(read)
const Routes = require('../DB/routes-definition');

async function readRoute(req, res) { // 비동기적 동작
    const userId = req.params.user_id; // 요청에서 user_id 파라미터를 가져오기

    try {
        const routes = await Routes.find({ user_id: userId }); // user_id를 사용하여 Routes 컬렉션에서 데이터 조회
        if (routes.length === 0) { // 만약 결과가 없다면, 404 상태 코드와 함께 메시지를 응답
            return res.status(404).json({ message: "User not found" });
        }
        const data = [];
        for (const info of routes) {
            const user_info = {
                name: info.route_name, // 이름
                day: info.route_day, // 여행일
                address: info.route_address, // 주소
                location: info.route_location, // 위치(위도와 경도)
                type: info.route_type // 여행지/음식점/숙소를 나타내는 타입
            }
            data.push(user_info)
        }
        res.json(data); // 조회된 데이터를 JSON 형태로 응답
    } catch (error) { // 에러가 발생한 경우, 500 상태 코드와 함께 에러 메시지를 응답
        res.status(500).json({ message: error.message }); // 500: 서버 에러를 총칭하는 에러 코드
    }
}

module.exports = readRoute; // readRoute 함수를 모듈로 export