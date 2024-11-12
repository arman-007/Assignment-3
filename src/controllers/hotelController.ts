import fs from "fs";
import path from "path";
import { Request, Response, RequestHandler } from "express";
import multer from "multer";
import slugify from "slugify";

const hotelsDataDir = "./src/data/hotels";
const uploadsDir = "./uploads/images";

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

export function readHotelData(hotelId: string): Hotel | null {
  const filePath = path.join(hotelsDataDir, `${hotelId}.json`);
  if (!fs.existsSync(filePath)) return null;
  const hotelData = fs.readFileSync(filePath, "utf-8");
  return JSON.parse(hotelData);
}

const writeHotelData = (hotel: Hotel): void => {
  const filePath = path.join(hotelsDataDir, `${hotel.id}.json`);
  fs.writeFileSync(filePath, JSON.stringify(hotel, null, 2));
};

// Configure multer for file storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = "./uploads/images";
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const extension = path.extname(file.originalname);
    cb(null, file.fieldname + "-" + uniqueSuffix + extension);
  },
});

const upload = multer({ storage });

export const hotelController = {
  getAllHotelIdsAndTitles: (req: Request, res: Response): void => {
    try {
      // Read all files in the hotel directory
      const hotelFiles = fs.readdirSync(hotelsDataDir);

      // Initialize an empty object to store hotel IDs and titles
      const hotelsInfo: { [key: string]: string } = {};

      // Loop through each file and extract the ID and title
      hotelFiles.forEach((file) => {
        const filePath = path.join(hotelsDataDir, file);
        const hotelData = JSON.parse(fs.readFileSync(filePath, "utf-8"));

        // Ensure that both `id` and `title` exist in each file
        if (hotelData.id && hotelData.title) {
          hotelsInfo[hotelData.id] = hotelData.title;
        }
      });

      // Respond with the object containing hotel IDs and titles
      res.status(200).json(hotelsInfo);
    } catch (error) {
      console.error("Error reading hotel data:", error);
      res
        .status(500)
        .json({ error: "An error occurred while fetching hotel data." });
    }
  },

  addHotel: [
    upload.array("images"), // Field name 'images' should match the one in the form data
    (req: Request, res: Response) => {
      try {
        // Get image paths from the uploaded files
        const imagePaths = req.files
          ? (req.files as Express.Multer.File[]).map((file) => file.path)
          : [];

        // Generate slug from title
        const slug = slugify(String(req.body.title), {
          lower: true,
          strict: true,
        });

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
          amenities: req.body.amenities ? req.body.amenities.split(",") : [],
          hostInfo: req.body.hostInfo ? JSON.parse(req.body.hostInfo) : {},
          address: req.body.address,
          latitude: parseFloat(req.body.latitude),
          longitude: parseFloat(req.body.longitude),
          rooms: req.body.rooms ? JSON.parse(req.body.rooms) : [],
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
        res
          .status(500)
          .json({ error: "An error occurred while adding the hotel." });
      }
    },
  ],

  getHotelById: (req: Request, res: Response): void => {
    const hotelId = req.params.hotelId;
    const hotel = readHotelData(hotelId);

    if (!hotel) {
      res.status(404).json({ error: "Hotel not found" });
      return; // Ensure return here to avoid further execution
    }

    res.json(hotel);
  },

  updateHotel: (req: Request, res: Response): void => {
    const hotelId = req.params.hotelId;
    console.log(`Fetching hotel data with ID: ${hotelId}`);

    if (Object.keys(req.body).length === 0) {
      res.status(400).json({ error: "No data provided to update." });
      return;
    }

    const hotel = readHotelData(hotelId);
    if (!hotel) {
      res.status(404).json({ error: "Hotel not found" });
      return;
    }

    console.log("Original hotel data:", hotel);
    console.log("Request body data:", req.body);

    const updatedHotel = { ...hotel, ...req.body };
    writeHotelData(updatedHotel);

    // Read back the data after writing to ensure it's updated
    const latestHotelData = readHotelData(hotelId);
    console.log("Updated hotel data:", latestHotelData);

    res.json(latestHotelData);
  },

  uploadImages: [
    upload.array("images"), // Expecting multiple images
    (req: Request, res: Response): void => {
      const hotelId = req.body.hotelId;
      if (!hotelId) {
        res.status(400).json({ error: "Hotel ID is required." });
        return;
      }

      const hotel = readHotelData(hotelId);
      if (!hotel) {
        res.status(404).json({ error: "Hotel not found." });
        return;
      }

      // Check if images were uploaded
      const imageFiles = req.files as Express.Multer.File[];
      if (!imageFiles || imageFiles.length === 0) {
        res.status(400).json({ error: "No images uploaded." });
        return;
      }

      // Update the images array with new image paths
      const newImagePaths = imageFiles.map(
        (file) => `/uploads/images/${file.filename}`
      );
      hotel.images = [...hotel.images, ...newImagePaths];

      // Write the updated hotel data back to its JSON file
      writeHotelData(hotel);

      res.status(200).json({
        message: "Images uploaded successfully.",
        images: hotel.images,
      });
    },
  ],

  deleteHotelById: (req: Request, res: Response): void => {
    const hotelId = req.params.hotelId;
    const filePath = path.join(hotelsDataDir, `${hotelId}.json`);

    // Check if the file exists
    if (!fs.existsSync(filePath)) {
      res.status(404).json({ error: "Hotel not found" });
      return;
    }

    try {
      // Delete the hotel file
      fs.unlinkSync(filePath);
      res.status(200).json({ message: "Hotel deleted successfully" });
    } catch (error) {
      console.error("Error deleting hotel:", error);
      res
        .status(500)
        .json({ error: "An error occurred while deleting the hotel" });
    }
  },
};

export default hotelController;
