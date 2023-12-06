const express = require('express'); // express는 웹 애플리케이션 프레임워크
const bodyParser = require('body-parser'); // body-parser는 요청의 본문을 파싱하는 미들웨어
require('dotenv').config();
const mongoose = require('mongoose');
const savePersonality = require('./api/personalities-create.js'); // 사용자 취향(선호도)을 저장하는 역할
const readPersonality = require('./api/personalities-read.js'); // 사용자 취향(선호도)을 받아오는 역할
const saveInformation = require('./api/informations-create.js'); // 여행지 정보를 저장하는 역할
const readInformation = require('./api/informations-read.js'); // 여행지 정보를 가져오는 역할
const saveRoute = require('./api/routes-create.js'); // 경로를 저장하는 역할
const readRoute = require('./api/routes-read.js'); // 경로를 가져오는 역할
const recommend = require('./api/recommend.js'); // 사용자 취향 저장 - 여행지 정보 및 경로 계산 - 경로 반환
const readEdit = require('./api/edit-read.js'); // 편집을 위한 여행지 정보 가져오기
const modifyRoute = require('./api/routes-modify.js'); // 사용자로부터 경로를 수정받은 데이터 저장
const uri = process.env.uri; // MongoDB Atlas 연결 URI

mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true, w: 'majority' }) // DB 연결
    .then(() => console.log('MongoDB가 연결되었습니다.'))
    .catch(error => console.log('MongoDB 연결에 실패했습니다: ', error));

const app = express(); // express를 사용해 앱 객체를 생성
app.use(bodyParser.json()); // app에 body-parser의 json 미들웨어를 사용하도록 설정
app.use(express.urlencoded({ extended: true })); // URL 인코딩된 데이터를 파싱하기 위해

app.post('/api/savePersonality', savePersonality); // 사용자 취향(선호도)을 저장하는 api
app.post('/api/saveInformation/:user_id', saveInformation); // 여행지 정보를 추천, 저장하는 api
app.post('/api/saveRoute/:user_id', saveRoute); // 경로를 저장하는 api
app.post('/api/recommend', recommend); // 종합 api
app.post('/api/modifyRoute/:user_id', modifyRoute); // 경로 수정 api
app.get('/api/readPersonality/:user_id', readPersonality); // 사용자 취향(선호도)을 가져오는 api
app.get('/api/readInformation/:user_id', readInformation); // 저장된 여행지 정보를 가져오는 api
app.get('/api/readRoute/:user_id', readRoute); // 저장된 여행지 정보를 가져오는 api
app.get('/api/readEdit/:edit_city', readEdit); // 편집을 위한 여행지 정보를 가져오는 api

const PORT = 8001;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});