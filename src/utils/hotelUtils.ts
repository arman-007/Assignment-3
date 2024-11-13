import fs from "fs";
import path from "path";
import { Hotel } from "../types/hotelTypes";

const hotelsDataDir = "./src/data/hotels";

export async function readHotelData(hotelId: string): Promise<Hotel | null> {
  const filePath = path.join(hotelsDataDir, `${hotelId}.json`);
  try {
    await fs.promises.access(filePath);
    const hotelData = await fs.promises.readFile(filePath, "utf-8");
    return JSON.parse(hotelData);
  } catch (error) {
    return null;
  }
}

export const writeHotelData = async (hotel: Hotel): Promise<void> => {
  const filePath = path.join(hotelsDataDir, `${hotel.id}.json`);
  await fs.promises.writeFile(filePath, JSON.stringify(hotel, null, 2));
};
