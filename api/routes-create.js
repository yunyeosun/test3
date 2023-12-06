// routes collection에 데이터 삽입
const Routes = require('../DB/routes-definition');
const route = require('../route/route.js');

async function saveRoute(req, res) { // 비동기적 동작
    const userId = req.params.user_id; // 요청에서 user_id 파라미터를 가져오기

    try {
        const user_info_list = await route(userId); // 경로 정보 배열
        // user_info_list 배열의 각 요소를 순회하며 DB에 저장
        for (let i = 0; i < user_info_list.length; i++) {
            for (const info of user_info_list[i]) {
                // 새로운 정보 인스턴스 생성
                const user_info = {
                    user_id: userId, // 유저 id
                    route_name: info.name, // 장소 이름
                    route_day: info.day,
                    route_location: info.location,
                    route_address: info.address,
                    route_type: info.type
                }

                const newRoute = new Routes(user_info);
                // 정보를 DB에 저장
                await newRoute.save();
            }
        }

        res.status(200).json({ message: `user_id: ${userId} 의 모든 경로가 정상적으로 저장되었습니다.` });

    } catch (error) { // 에러가 발생한 경우, 500 상태 코드와 함께 에러 메시지를 응답
        res.status(500).json({ message: error.message }); // 500: 서버 에러를 총칭하는 에러 코드
    }

}

module.exports = saveRoute; // saveRoute 함수를 모듈로 export