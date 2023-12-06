export interface Routes {
    trans_id: string,
    routes: [
    {
        result_code: number,
        result_msg: string,
        sections: [
        {
            distance: number,
            duration: number,
            bound: {
            min_x: number,
            min_y: number,
            max_x: number,
            max_y: number
            },
            roads: [
            {
                name: string,
                distance: number,
                duration: number,
                traffic_speed: number,
                traffic_state: number,
                vertexes: number[],
            }],
        }],
        summary: {
            distance: number,
            fare: {
                taxi: number,
            },
        }
    }]
}