import axios from 'axios';
import { useMutation } from 'react-query';
import { Coordinate, Routes } from '../types';
import { pathState, priceState } from "../state";
import { useRecoilValue, useSetRecoilState } from 'recoil';

const postRoutesToKaKaoMap = async (origin: Coordinate | undefined, destination: Coordinate | undefined, waypoints: (Coordinate | undefined)[]): Promise<Routes> => {
	const response = await axios.post(
		'https://apis-navi.kakaomobility.com/v1/waypoints/directions', {
            origin: origin,
            destination: destination,
            waypoints: waypoints,
        }, {
            headers: {
              "Content-Type": "application/json",
              Authorization: `KakaoAK ${import.meta.env.VITE_KAKAO_REST_API_KEY}`,
        }});
	return response.data;
};
export function usePostRoutesToKaKaoMap(origin: Coordinate | undefined, destination: Coordinate | undefined, waypoints: (Coordinate | undefined)[]) {
    const setPath = useSetRecoilState(pathState);
    const setPrice = useSetRecoilState(priceState);
    const price = useRecoilValue(priceState);
    return useMutation(() => postRoutesToKaKaoMap(origin, destination, waypoints), {
        onSuccess: (response) => {
        const newPath: { lat: number; lng: number; }[] = [];
        response.routes[0].sections.map((section) => {
            section.roads.map((route) => {
                for (let i = 0; i < route.vertexes.length; i += 2) {
                    if (i + 1 < route.vertexes.length) {
                        const pair = { lng: route.vertexes[i], lat: route.vertexes[i + 1] };
                        newPath.push(pair);
                    }
                }
            })
        })
        setPrice({...price, taxi: response.routes[0].summary.fare.taxi, distance: response.routes[0].summary.distance})
        setPath({
            path: [...newPath]
        });
    }});
}
