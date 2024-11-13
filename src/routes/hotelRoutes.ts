import express, { Request, Response, Router } from 'express';
import {hotelController} from '../controllers/hotelController';

const router: Router = express.Router();

router.get('/hotel', hotelController.getAllHotelIdsAndTitles);
router.post('/hotel', hotelController.addHotel);
router.post('/images', hotelController.uploadImages);
router.get('/hotel/:hotelId', hotelController.getHotelById);
router.put('/hotel/:hotelId', hotelController.updateHotel);
router.delete('/hotel/:hotelId', hotelController.deleteHotelById);

export default router;
