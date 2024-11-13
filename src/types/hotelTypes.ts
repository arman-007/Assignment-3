export interface Hotel {
  id: string;
  title: string;
  slug: string;
  description: string;
  images: string[];
  guestCount: number;
  bedroomCount: number;
  bathroomCount: number;
  amenities: string[];
  hostInfo: object;
  address: string;
  latitude: number;
  longitude: number;
  rooms: object[];
}

export interface Room {
  hotel_slug: string;
  room_slug: string;
  room_image: string[];
  room_title: string;
  bedroom_count: number;
}
