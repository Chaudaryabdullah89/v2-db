import express from 'express';
import cors from 'cors';

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ message: 'Simple server is running!' });
});

app.get('/api/blogs', (req, res) => {
  res.json({ 
    success: true, 
    data: [
      { id: 1, title: 'Test Blog 1', content: 'Test content 1' },
      { id: 2, title: 'Test Blog 2', content: 'Test content 2' }
    ],
    pagination: {
      currentPage: 1,
      totalPages: 1,
      totalPosts: 2
    }
  });
});

app.listen(port, () => {
  console.log(`Simple server is running on port ${port}`);
}); 