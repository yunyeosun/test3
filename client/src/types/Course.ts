export interface Course {
    address: string;
    day: number,
    location: {
        latitude: number,
        longitude: number;
    }
    name: string;
    type: string;
    price: number;
    image_url: string;
    food_imageUrl: string;
    food_name: string;
}