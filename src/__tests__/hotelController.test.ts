// src/__tests__/hotelController.test.ts
import request from "supertest";
import { app } from "../index"; // Ensure `app` is your Express app entry point
import fs from "fs";
import sharp from "sharp"
import path from "path"
// import * as hotelControllerModule from "../src/controllers/hotelController";

  // Define the base directory path as expected in your controller
  const basePath = "./src/data/hotels/";

jest.mock("fs", () => {
  const original = jest.requireActual("fs");
  return {
    ...original,
    promises: {
      readdir: jest.fn(),
      readFile: jest.fn(),
    },
  };
});

// describe("GET /hotel - getAllHotelIdsAndTitles", () => {
//   beforeEach(() => {
//     jest.clearAllMocks();
//   });

//   it("should return hotel IDs and titles when files are present", async () => {
//     (fs.promises.readdir as jest.Mock).mockResolvedValue([
//       "1731327753872.json",
//       "1731329809817.json",
//     ]);
//     (fs.promises.readFile as jest.Mock).mockImplementation(
//       (filePath: string) => {
//         if (filePath.includes("1731327753872.json")) {
//           return JSON.stringify({
//             id: "1731327753872",
//             title: "Sunset Villa 12",
//           });
//         } else if (filePath.includes("1731329809817.json")) {
//           return JSON.stringify({
//             id: "1731329809817",
//             title: "Sunset Villa 12",
//           });
//         }
//         return null;
//       }
//     );

//     const response = await request(app).get("/hotel");

//     const expectedData = {
//       "1731327753872": "Sunset Villa 12",
//       "1731329809817": "Sunset Villa 12",
//     };

//     expect(response.status).toBe(200);
//     expect(response.body).toEqual(expectedData);
//   });

//   it("should handle errors gracefully", async () => {
//     (fs.promises.readdir as jest.Mock).mockImplementation(() => {
//       throw new Error("Failed to read directory");
//     });

//     const response = await request(app).get("/hotel");

//     expect(response.status).toBe(500);
//     expect(response.body).toEqual({
//       error: "An error occurred while fetching hotel data.",
//     });
//   });
// });

// describe("GET /hotel/:hotelId - getHotelById", () => {


//   beforeEach(() => {
//     jest.clearAllMocks();
//   });

//   it("should return hotel data when hotel exists", async () => {
//     const mockHotelId = "1";
//     const mockHotelData = {
//       id: "1",
//       title: "Hotel One",
//       slug: "hotel-one",
//       description: "A test hotel",
//       images: [],
//       guestCount: 2,
//       bedroomCount: 1,
//       bathroomCount: 1,
//       amenities: ["WiFi", "Pool"],
//       hostInfo: {},
//       address: "123 Test St",
//       latitude: 40.7128,
//       longitude: -74.006,
//       rooms: [],
//     };

//     (fs.promises.readFile as jest.Mock).mockImplementation((filePath: string) => {
//       console.log(`Attempting to read file at path: ${filePath}`);
//       if (filePath === `${basePath}${mockHotelId}.json`) {
//         return Promise.resolve(JSON.stringify(mockHotelData));
//       }
//       return Promise.reject(new Error("File not found"));
//     });

//     const response = await request(app).get(`/hotel/${mockHotelId}`);
//     const expectedFilePath = `${basePath}1.json`;

//     expect(fs.promises.readFile).toHaveBeenCalledWith(expectedFilePath);
//     expect(response.status).toBe(200);
//     expect(response.body).toEqual(mockHotelData);
//   });


//   it("should return 404 when hotel does not exist", async () => {
//     const mockHotelId = "nonexistent_id";

//     (fs.promises.readFile as jest.Mock).mockImplementation(() => {
//       throw new Error("File not found");
//     });

//     const response = await request(app).get(`/hotel/${mockHotelId}`);

//     expect(response.status).toBe(404);
//     expect(response.body).toEqual({ error: "Hotel not found" });
//   });
// });

jest.mock("fs", () => {
  const original = jest.requireActual("fs");
  return {
    ...original,
    promises: {
      mkdir: jest.fn(),
      readFile: jest.fn(),
      writeFile: jest.fn(),
      access: jest.fn(),
    },
  };
});

// Mock `sharp` for image processing
jest.mock("sharp");

// describe("POST /images - uploadImages", () => {
//   beforeEach(() => {
//     jest.clearAllMocks();
//   });

//   it("should upload and process images successfully", async () => {
//     const mockHotelId = "1731386715312";
//     const mockHotelData = {
//       id: mockHotelId,
//       images: [],
//       title: "Test Hotel",
//     };

//     // Mock the response of reading hotel data
//     (fs.promises.readFile as jest.Mock).mockResolvedValue(JSON.stringify(mockHotelData));

//     // Mock the file access to always succeed
//     (fs.promises.access as jest.Mock).mockResolvedValue(true);

//     // Mock creating the directory if it doesn't exist
//     (fs.promises.mkdir as jest.Mock).mockResolvedValue(undefined);

//     // Mock sharp processing
//     const sharpMock = {
//       resize: jest.fn().mockReturnThis(),
//       webp: jest.fn().mockReturnThis(),
//       toFile: jest.fn().mockResolvedValue(undefined),
//     };
//     (sharp as jest.Mock).mockImplementation(() => sharpMock);

//     // Perform a POST request to the /images endpoint
//     const response = await request(app)
//       .post("/images")
//       .field("hotelId", mockHotelId)
//       .attach("images", Buffer.from("fake image buffer"), {
//         filename: "test.jpg",
//         contentType: "image/jpeg",
//       });

//     // Expectations
//     expect(response.status).toBe(200);
//     expect(response.body).toHaveProperty("message", "Images uploaded and processed successfully.");
//     expect(response.body).toHaveProperty("images");

//     // Check if sharp was called to process the image
//     expect(sharp).toHaveBeenCalledWith(expect.any(Buffer));
//     expect(sharpMock.resize).toHaveBeenCalledWith({ width: 800 });
//     expect(sharpMock.webp).toHaveBeenCalledWith({ quality: 80 });
//     expect(sharpMock.toFile).toHaveBeenCalled();

//     // Ensure file handling calls were made
//     expect(fs.promises.mkdir).toHaveBeenCalled();
//     expect(fs.promises.readFile).toHaveBeenCalled();
//     expect(fs.promises.writeFile).toHaveBeenCalled();
//   });

//   it("should return 400 if no hotelId is provided", async () => {
//     const response = await request(app)
//       .post("/images")
//       .attach("images", Buffer.from("fake image buffer"), "test.jpg");

//     expect(response.status).toBe(400);
//     expect(response.body).toEqual({ error: "Hotel ID is required." });
//   });

//   it("should return 404 if hotel is not found", async () => {
//     const mockHotelId = "nonexistent_id";

//     // Mock the response of reading hotel data to throw an error (simulating file not found)
//     (fs.promises.readFile as jest.Mock).mockRejectedValue(new Error("File not found"));

//     const response = await request(app)
//       .post("/images")
//       .field("hotelId", mockHotelId)
//       .attach("images", Buffer.from("fake image buffer"), "test.jpg");

//     expect(response.status).toBe(404);
//     expect(response.body).toEqual({ error: "Hotel not found." });
//   });
// });


jest.mock("fs", () => {
  const original = jest.requireActual("fs");
  return {
    ...original,
    promises: {
      access: jest.fn(),
      unlink: jest.fn(),
    },
  };
});

describe("DELETE /hotel/:hotelId - deleteHotelById", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should delete a hotel when it exists", async () => {
    const mockHotelId = "12345";
    const filePath = path.join("./src/data/hotels", `${mockHotelId}.json`);

    // Mock `fs.promises.access` and `fs.promises.unlink` to simulate a successful file check and deletion
    (fs.promises.access as jest.Mock).mockResolvedValue(undefined);
    (fs.promises.unlink as jest.Mock).mockResolvedValue(undefined);

    const response = await request(app).delete(`/hotel/${mockHotelId}`);

    // Assertions
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ message: "Hotel deleted successfully" });

    // Verify that `access` and `unlink` were called with the correct path
    expect(fs.promises.access).toHaveBeenCalledWith(filePath);
    expect(fs.promises.unlink).toHaveBeenCalledWith(filePath);
  });

  it("should return 404 if the hotel does not exist", async () => {
    const mockHotelId = "nonexistent_id";
    const filePath = path.join("./src/data/hotels", `${mockHotelId}.json`);

    // Mock `fs.promises.access` to throw an error, simulating a missing file
    (fs.promises.access as jest.Mock).mockRejectedValue(new Error("File not found"));

    const response = await request(app).delete(`/hotel/${mockHotelId}`);

    // Assertions
    expect(response.status).toBe(404);
    expect(response.body).toEqual({ error: "Hotel not found" });

    // Verify that `access` was called and `unlink` was not called
    expect(fs.promises.access).toHaveBeenCalledWith(filePath);
    expect(fs.promises.unlink).not.toHaveBeenCalled();
  });
});
