import express, { Request, Response } from 'express';
import hotelController from '../controllers/hotelController';
// import multer from 'multer';

const router = express.Router();
// const upload = multer({ dest: 'src/images/' });

router.get('/', (req: Request, res: Response) => {
    res.send('Hello, World!')
});
router.post('/hotel/', hotelController.addHotel);
// router.post('/hotel/images', upload.array('images'), (req: Request, res: Response) => hotelController.uploadImages(req, res));
// router.get('/hotel/:hotelId', (req: Request, res: Response) => hotelController.getHotelById(req, res));
// router.put('/hotel/:hotelId', (req: Request, res: Response) => hotelController.updateHotel(req, res));

export default router;
