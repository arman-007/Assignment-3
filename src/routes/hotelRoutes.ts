import express, { Request, Response, Router } from 'express';
import {hotelController} from '../controllers/hotelController';
// import multer from 'multer';

const router: Router = express.Router();
// const upload = multer({ dest: 'src/images/' });

// router.get('/', (req: Request, res: Response) => {res.send('Hello, World!')});

router.get('/hotel', hotelController.getAllHotelIdsAndTitles);
router.post('/hotel', hotelController.addHotel);
router.post('/hotel/images', hotelController.uploadImages);
router.get('/hotel/:hotelId', hotelController.getHotelById);
router.put('/hotel/:hotelId', hotelController.updateHotel);
router.delete('/hotel/:hotelId', hotelController.deleteHotelById);

export default router;
