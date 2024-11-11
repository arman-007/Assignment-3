import fs from 'fs';
import path from 'path';
import { Request, Response } from 'express';
import multer from 'multer';
import slugify from 'slugify';

const hotelsDataDir = './src/data/hotels';

interface Hotel {
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

interface Room {
  hotel_slug: string;
  room_slug: string;
  room_image: string[];
  room_title: string;
  bedroom_count: number;
}

function readData(): Hotel[] {
  const data = fs.readFileSync(hotelsDataDir, 'utf-8');
  return JSON.parse(data);
}

function writeHotelData(hotel: Hotel): void {
    const filePath = path.join(hotelsDataDir, `${hotel.id}.json`);
    fs.writeFileSync(filePath, JSON.stringify(hotel, null, 2));
}

// Configure multer for file storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      const dir = './uploads/images';
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      cb(null, dir);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      const extension = path.extname(file.originalname);
      cb(null, file.fieldname + '-' + uniqueSuffix + extension);
    }
});
  
const upload = multer({ storage });

const hotelController = {
    addHotel: [
        upload.array('images'), // Field name 'images' should match the one in the form data
        (req: Request, res: Response) => {
            try {
                // Get image paths from the uploaded files
                const imagePaths = req.files ? (req.files as Express.Multer.File[]).map(file => file.path) : [];

                // Generate slug from title
                const slug = slugify(String(req.body.title), { lower: true, strict: true });

                // Parse non-string fields if necessary
                const guestCount = parseInt(req.body.guestCount, 10);
                const bedroomCount = parseInt(req.body.bedroomCount, 10);
                const bathroomCount = parseInt(req.body.bathroomCount, 10);

                const newHotel: Hotel = {
                    id: String(Date.now()),
                    slug,
                    images: imagePaths,
                    title: req.body.title,
                    description: req.body.description,
                    guestCount: isNaN(guestCount) ? 0 : guestCount,
                    bedroomCount: isNaN(bedroomCount) ? 0 : bedroomCount,
                    bathroomCount: isNaN(bathroomCount) ? 0 : bathroomCount,
                    amenities: req.body.amenities ? req.body.amenities.split(',') : [],
                    hostInfo: req.body.hostInfo ? JSON.parse(req.body.hostInfo) : {},
                    address: req.body.address,
                    latitude: parseFloat(req.body.latitude),
                    longitude: parseFloat(req.body.longitude),
                    rooms: req.body.rooms ? JSON.parse(req.body.rooms) : []
                };

                // Create the hotels directory if it doesn't exist
                if (!fs.existsSync(hotelsDataDir)) {
                  fs.mkdirSync(hotelsDataDir, { recursive: true });
                }

                // Write hotel data to a JSON file
                writeHotelData(newHotel);

                res.status(201).json(newHotel);
            } catch (error) {
                console.error("Error adding hotel:", error);
                res.status(500).json({ error: "An error occurred while adding the hotel." });
            }
        }
    ],

//   uploadImages: (req: Request, res: Response): void => {
//     const hotelId = req.body.hotelId;
//     const hotels = readData();
//     const hotel = hotels.find(h => h.id === hotelId);
  
//     if (!hotel) {
//       return res.status(404).json({ error: 'Hotel not found' });
//     }
  
//     // Cast `req.files` as `Express.Multer.File[]` for TypeScript
//     const files = req.files as Express.Multer.File[];
//     hotel.images = files.map((file) => `/images/${file.filename}`);
//     writeData(hotels);
  
//     res.status(200).json({ message: 'Images uploaded', images: hotel.images });
//   },

//   getHotelById: (req: Request, res: Response): Response | void => {
//     const hotelId = req.params.hotelId;
//     const hotels = readData();
//     const hotel = hotels.find(h => h.id === hotelId || h.slug === hotelId);
  
//     if (!hotel) {
//       return res.status(404).json({ error: 'Hotel not found' });
//     }
  
//     res.json(hotel);
//   },
  

//   updateHotel: (req: Request, res: Response): Response | void => {
//     const hotelId = req.params.hotelId;
//     const hotels = readData();
//     const hotelIndex = hotels.findIndex(h => h.id === hotelId);

//     if (hotelIndex === -1) {
//       return res.status(404).json({ error: 'Hotel not found' });
//     }

//     hotels[hotelIndex] = { ...hotels[hotelIndex], ...req.body };
//     writeData(hotels);

//     res.json(hotels[hotelIndex]);
//   }
};

export default hotelController;
