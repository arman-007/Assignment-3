import cors from "cors"
import helmet from "helmet"
import express, {Request, Response} from 'express';
import hotelRoutes from './routes/hotelRoutes';

const app = express();
const PORT = 3000; 

app.use(express.json());
app.use(express.urlencoded({extended : true}))
app.use(cors())
app.use(helmet())

app.use('/', hotelRoutes);

app.get('/', (req: Request, res: Response) => {
  res.send('Hello, World!')
})

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});

export default app;
