// personality 컬렉션 데이터 조회(read)
const Personalities = require('../DB/personalities-definition');

async function readPersonality(req, res) { // 비동기적 동작
    const userId = req.params.user_id; // 요청에서 user_id 파라미터를 가져오기

    try {
        const personalities = await Personalities.findOne({ user_id: userId }); // user_id를 사용하여 Personalities 컬렉션에서 단일 문서를 조회
        if (!personalities) { // 만약 결과가 없다면, 404 상태 코드와 함께 메시지를 응답
            return res.status(404).json({ message: "User not found" });
        }
        res.json(personalities); // 조회된 데이터를 JSON 형태로 응답
    } catch (error) { // 에러가 발생한 경우, 500 상태 코드와 함께 에러 메시지를 응답
        res.status(500).json({ message: error.message }); // 500: 서버 에러를 총칭하는 에러 코드
    }
}

module.exports = readPersonality; // readPersonality 함수를 모듈로 export