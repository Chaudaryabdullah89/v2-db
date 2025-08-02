import express from 'express';
import cors from 'cors';

const app = express();
const port = 3000;

app.use(cors({
  origin: true,
  credentials: true
}));

app.use(express.json());

app.get('/', (req, res) => {
  res.json({ message: 'Test server is running!' });
});

app.get('/api/test', (req, res) => {
  res.json({ message: 'API test endpoint working!' });
});

app.listen(port, () => {
  console.log(`Test server is running on port ${port}`);
}); 