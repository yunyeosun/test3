// routes collection에 데이터 수정
const Routes = require('../DB/routes-definition.js');

async function modifyRoute(req, res) { // 비동기적 동작
    const userId = req.params.user_id; // 요청에서 user_id 파라미터를 가져오기
    const userData = req.body; // 사용자가 수정한 경로 데이터 가져오기
    try {
        // 1. 기존 경로 데이터 삭제
        await Routes.deleteMany({ user_id: userId }).then();
        // 2. 수정된 경로 데이터 저장
        // userData의 각 요소를 순회하며 DB에 저장
        for (let i = 0; i < userData.length; i++) {
            // 새로운 정보 인스턴스 생성
            const user_info = {
                user_id: userId, // 유저 id
                route_name: userData[i].name, // 장소 이름
                route_day: userData[i].day,
                route_location: userData[i].location,
                route_address: userData[i].address,
                route_type: userData[i].type,
                route_price: userData[i].price
            }

            const newRoute = new Routes(user_info);
            // 정보를 DB에 저장
            await newRoute.save();

        }

        res.status(200).json({ message: `user_id: ${userId} 의 모든 경로가 정상적으로 수정되었습니다.` });

    } catch (error) { // 에러가 발생한 경우, 500 상태 코드와 함께 에러 메시지를 응답
        res.status(500).json({ message: error.message }); // 500: 서버 에러를 총칭하는 에러 코드
    }

}

module.exports = modifyRoute; // modifyRoute 함수를 모듈로 export