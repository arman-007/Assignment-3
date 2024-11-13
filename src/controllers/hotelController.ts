// src/controllers/hotelController.ts
import fs from "fs";
import { Request, Response } from "express";
import multer from "multer";
import slugify from "slugify";
import path from "path"
import sharp from "sharp"

import { upload } from "../config/multerConfig";
import { readHotelData, writeHotelData } from "../utils/hotelUtils";
import { Hotel } from "../types/hotelTypes";


const uploadsDir = "./uploads/images";
const storage = multer.memoryStorage();


export const hotelController = {
  getAllHotelIdsAndTitles: async (req: Request, res: Response): Promise<void> => {
    try {
      const hotelFiles = await fs.promises.readdir("./src/data/hotels");
      const hotelsInfo: { [key: string]: string } = {};
  
      for (const file of hotelFiles) {
        const filePath = path.join("./src/data/hotels", file);
        const hotelData = JSON.parse(await fs.promises.readFile(filePath, "utf-8"));
        if (hotelData.id && hotelData.title) {
          hotelsInfo[hotelData.id] = hotelData.title;
        }
      }
  
      res.status(200).json(hotelsInfo);
    } catch (error) {
      res.status(500).json({ error: "An error occurred while fetching hotel data." });
    }
  },

  addHotel: [
    upload.array("images"),
    async (req: Request, res: Response) => {
      try {
        const imagePaths = req.files ? (req.files as Express.Multer.File[]).map((file) => file.path) : [];
        const slug = slugify(String(req.body.title), { lower: true, strict: true });
        const newHotel: Hotel = {
          id: String(Date.now()),
          slug,
          images: imagePaths,
          title: req.body.title,
          description: req.body.description,
          guestCount: parseInt(req.body.guestCount, 10) || 0,
          bedroomCount: parseInt(req.body.bedroomCount, 10) || 0,
          bathroomCount: parseInt(req.body.bathroomCount, 10) || 0,
          amenities: req.body.amenities ? req.body.amenities.split(",") : [],
          hostInfo: req.body.hostInfo ? JSON.parse(req.body.hostInfo) : {},
          address: req.body.address,
          latitude: parseFloat(req.body.latitude),
          longitude: parseFloat(req.body.longitude),
          rooms: req.body.rooms ? JSON.parse(req.body.rooms) : [],
        };

        await writeHotelData(newHotel);
        res.status(201).json(newHotel);
      } catch (error) {
        res.status(500).json({ error: "An error occurred while adding the hotel." });
      }
    },
  ],

  getHotelById: async (req: Request, res: Response): Promise<void> => {
    const hotelId = req.params.hotelId;
    const hotel = await readHotelData(hotelId);
    if (!hotel) {
      res.status(404).json({ error: "Hotel not found" });
      return;
    }
    res.json(hotel);
  },

  updateHotel: async (req: Request, res: Response): Promise<void> => {
    const hotelId = req.params.hotelId;
    if (Object.keys(req.body).length === 0) {
      res.status(400).json({ error: "No data provided to update." });
      return;
    }

    const hotel = await readHotelData(hotelId);
    if (!hotel) {
      res.status(404).json({ error: "Hotel not found" });
      return;
    }

    const updatedHotel = { ...hotel, ...req.body };
    await writeHotelData(updatedHotel);
    res.json(updatedHotel);
  },

  uploadImages: [
    upload.array("images", 10), // Allow up to 10 images at once
    async (req: Request, res: Response): Promise<void> => {
      const hotelId = req.body.hotelId;
  
      if (!hotelId) {
        res.status(400).json({ error: "Hotel ID is required." });
        return;
      }
  
      const hotel = await readHotelData(hotelId);
      if (!hotel) {
        res.status(404).json({ error: "Hotel not found." });
        return;
      }
  
      const imageFiles = req.files as Express.Multer.File[];
      if (!imageFiles || imageFiles.length === 0) {
        res.status(400).json({ error: "No images uploaded." });
        return;
      }
  
      console.log("Files received:", req.files);
      console.log("Body received:", req.body);
  
      try {
        await fs.promises.access(uploadsDir);
      } catch {
        console.log("Creating uploads directory:", uploadsDir);
        await fs.promises.mkdir(uploadsDir, { recursive: true });
      }
  
      const newImagePaths: string[] = [];
      for (const file of imageFiles) {
        const filePath = file.path;
  
        try {
          // Read the file from disk instead of using buffer
          const fileData = await fs.promises.readFile(filePath);
          
          const fileName = `image-${Date.now()}-${Math.round(Math.random() * 1e9)}.webp`;
          const processedFilePath = path.join(uploadsDir, fileName);
  
          await sharp(fileData)
            .resize({ width: 800 }) // Resize to 800px max width
            .webp({ quality: 80 }) // Convert to WebP with 80 quality
            .toFile(processedFilePath);
  
          newImagePaths.push(`/uploads/images/${fileName}`);
          console.log("Image saved:", processedFilePath);
        } catch (err) {
          console.error(`Failed to process file ${file.originalname}:`, err);
          res.status(500).json({ error: `Failed to process file ${file.originalname}.` });
          return;
        }
      }
  
      hotel.images = [...hotel.images, ...newImagePaths];
      await writeHotelData(hotel);
  
      res.status(200).json({
        message: "Images uploaded and processed successfully.",
        images: hotel.images,
      });
    },
  ],
  deleteHotelById: async (req: Request, res: Response): Promise<void> => {
    const hotelId = req.params.hotelId;
    const filePath = path.join("./src/data/hotels", `${hotelId}.json`);

    try {
      await fs.promises.access(filePath);
      await fs.promises.unlink(filePath);
      res.status(200).json({ message: "Hotel deleted successfully" });
    } catch (error) {
      res.status(404).json({ error: "Hotel not found" });
    }
  },
};
