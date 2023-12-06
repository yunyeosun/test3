import axios from 'axios';
import { useQuery } from 'react-query';
import { Routes } from '../types';

const getRoutes = async (): Promise<Routes[]> => {
	const response = await axios.get(
		'/api/recommend'
	);
	return response.data.data;
};
export function useGetRoutes() {
	return useQuery("get-routes", () => getRoutes());
}