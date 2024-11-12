// src/__tests__/hotelController.test.ts
import multer from 'multer';
import request from "supertest";
import app from "../src/index"; // Assuming `app` is the Express app in your main entry file
import fs from "fs";
import path from "path";

import {hotelController, readHotelData} from "../src/controllers/hotelController"
// Mock dependencies
jest.mock("fs");

// GET /hotel
describe("GET /hotel - getAllHotelIdsAndTitles", () => {
  const hotelsDataDir = "./src/data/hotels"; // Adjust path if necessary

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return hotel IDs and titles when files are present", async () => {
    // Mock the behavior of readdirSync and readFileSync
    const mockFiles = ["1731327753872.json", "1731329809817.json"];
    const mockHotelData1 = { "id": "1731327753872", "title": "Sunset Villa 12" };
    const mockHotelData2 = { "id": "1731329809817", "title": "Sunset Villa 12" };

    // Mock readdirSync to return a list of hotel files
    (fs.readdirSync as jest.Mock).mockReturnValue(mockFiles);

    // Mock readFileSync to return specific hotel data based on file name
    (fs.readFileSync as jest.Mock).mockImplementation((filePath: string) => {
      if (filePath === path.join(hotelsDataDir, "1731327753872.json")) {
        return JSON.stringify(mockHotelData1);
      } else if (filePath === path.join(hotelsDataDir, "1731329809817.json")) {
        return JSON.stringify(mockHotelData2);
      }
    });

    // Send GET request
    const response = await request(app).get("/hotel");

    // Expected response data
    const expectedData = {
      "1731327753872": "Sunset Villa 12",
      "1731329809817": "Sunset Villa 12",
    };

    // Assertions
    expect(response.status).toBe(200);
    expect(response.body).toEqual(expectedData);
  });

  it("should handle errors gracefully", async () => {
    // Mock readdirSync to throw an error
    (fs.readdirSync as jest.Mock).mockImplementation(() => {
      throw new Error("Failed to read directory");
    });

    // Send GET request
    const response = await request(app).get("/hotel");

    // Assertions
    expect(response.status).toBe(500);
    expect(response.body).toEqual({
      error: "An error occurred while fetching hotel data.",
    });
  });
});

// GET /hotel/{hotel-id}
jest.mock('../src/controllers/hotelController', () => ({
  readHotelData: jest.fn(),
}));
describe("GET /hotel/:hotelId - getHotelById", () => {
  const hotelsDataDir = "./src/data/hotels"; // Adjust path if necessary

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return hotel data when hotel exists", async () => {
    const mockHotelId = "1";
    const mockHotelData = {
      id: "1",
      title: "Hotel One",
      description: "A test hotel",
      guestCount: 2,
      bedroomCount: 1,
      bathroomCount: 1,
      amenities: ["WiFi", "Pool"],
      address: "123 Test St",
      latitude: 40.7128,
      longitude: -74.006,
    };

    // Mock readHotelData to return hotel data for the given ID
    (hotelController.getAllHotelIdsAndTitles as jest.Mock).mockImplementation(() => Promise.resolve(mockHotelData));

    // Send GET request
    const response = await request(app).get(`/hotel/${mockHotelId}`);

    // Expected response data
    const expectedData = {
      id: "1",
      title: "Hotel One",
      description: "A test hotel",
      guestCount: 2,
      bedroomCount: 1,
      bathroomCount: 1,
      amenities: ["WiFi", "Pool"],
      address: "123 Test St",
      latitude: 40.7128,
      longitude: -74.006,
    };

    // Assertions
    expect(response.status).toBe(200);
    expect(response.body).toEqual(mockHotelData);
  });

  it("should return 404 when hotel does not exist", async () => {
    const mockHotelId = "nonexistent_id";

    // Mock readHotelData to return null for a non-existent hotel ID
    (readHotelData as jest.Mock).mockReturnValue(null);

    // Send GET request to /hotel/:hotelId
    const response = await request(app).get(`/hotel/${mockHotelId}`);

    // Assertions
    expect(response.status).toBe(404);
    expect(response.body).toEqual({ error: "Hotel not found" });
  });
});

// Partial mock to avoid affecting `diskStorage`
// jest.mock("multer", () => {
//     const multerActual = jest.requireActual("multer");
//     return jest.fn(() => ({
//         ...multerActual,
//         array: jest.fn(() => (req, res, next) => {
//             req.files = [
//                 {
//                     path: "/path/to/fake/file1.jpg",
//                     filename: "test-image1.jpg",
//                 },
//                 {
//                     path: "/path/to/fake/file2.jpg",
//                     filename: "test-image2.jpg",
//                 },
//             ];
//             next();
//         }),
//     }));
// });

// describe("POST /hotel - addHotel", () => {
//   const mockHotelData = {
//     title: "Test Hotel",
//     description: "A test hotel for unit testing",
//     guestCount: 2,
//     bedroomCount: 1,
//     bathroomCount: 1,
//     amenities: ["WiFi", "Air Conditioning"],
//     address: "123 Test St",
//     latitude: 40.7128,
//     longitude: -74.006,
//     images: [],
//   };

//   beforeEach(() => {
//     jest.clearAllMocks();
//   });

//   it("should add a new hotel and respond with 201 status and hotel data", async () => {
//     // Mock the fs functions to prevent actual file operations
//     (fs.existsSync as jest.Mock).mockReturnValue(true);
//     (fs.mkdirSync as jest.Mock).mockImplementation(() => {});
//     (fs.writeFileSync as jest.Mock).mockImplementation(() => {});

//     const response = await request(app)
//       .post("/hotel")
//       .field("title", mockHotelData.title)
//       .field("description", mockHotelData.description)
//       .field("guestCount", mockHotelData.guestCount.toString())
//       .field("bedroomCount", mockHotelData.bedroomCount.toString())
//       .field("bathroomCount", mockHotelData.bathroomCount.toString())
//       .field("amenities", JSON.stringify(mockHotelData.amenities))
//       .field("address", mockHotelData.address)
//       .field("latitude", mockHotelData.latitude.toString())
//       .field("longitude", mockHotelData.longitude.toString())
//       .attach("images", Buffer.from("fake image data"), {
//         filename: "test-image.jpg",
//         contentType: "image/jpeg",
//       });

//     // Assertions
//     expect(response.status).toBe(201);
//     expect(response.body).toHaveProperty("id");
//     expect(response.body).toHaveProperty("title", mockHotelData.title);
//     expect(response.body).toHaveProperty("images");
//     expect(response.body.images).toEqual(
//       expect.arrayContaining([expect.stringContaining("/uploads/")])
//     );

//     // Ensure fs functions were called to handle file operations
//     expect(fs.writeFileSync).toHaveBeenCalled();
//   });
// });
