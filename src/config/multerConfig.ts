import fs from "fs";
import path from "path";
import multer from "multer";

const uploadsDir = "./uploads/images";

const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    try {
      await fs.promises.access(uploadsDir);
    } catch {
      await fs.promises.mkdir(uploadsDir, { recursive: true });
    }
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const extension = path.extname(file.originalname);
    cb(null, file.fieldname + "-" + uniqueSuffix + extension);
  },
});

export const upload = multer({ storage });
