// 위도, 경도를 바탕으로 거리를 계산하는 하버사인 공식
async function haversine(lat1, lon1, lat2, lon2) {
    const R = 6371e3; // 지구의 반경(m)
    const radian1 = lat1 * Math.PI / 180; // 위도1을 라디안으로 변환
    const radian2 = lat2 * Math.PI / 180; // 위도2를 라디안으로 변환
    const lat_diff = (lat2 - lat1) * Math.PI / 180; // 위도 차이
    const lon_diff = (lon2 - lon1) * Math.PI / 180; // 경도 차이

    const a = Math.sin(lat_diff / 2) * Math.sin(lat_diff / 2) +
        Math.cos(radian1) * Math.cos(radian2) *
        Math.sin(lon_diff / 2) * Math.sin(lon_diff / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    const distance = R * c; // 최종 거리 (미터 단위)

    return distance;
}

module.exports = {
    haversine
}