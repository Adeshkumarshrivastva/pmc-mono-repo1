require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const authRoutes = require('./routes/auth');
const coursesRoutes = require('./routes/courses');
const enrollmentsRoutes = require('./routes/enrollments');
const materialsRoutes = require('./routes/materials');
const paymentRoutes = require('./routes/payment');
const quizRoutes = require('./routes/quiz');
const courseRoutes = require('./routes/course');

// Connect to MongoDB pmc-ambassador database
connectDB();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:3000', 'http://localhost:3001'],
  credentials: true,
}));
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/courses', coursesRoutes);
app.use('/api/enrollments', enrollmentsRoutes);
app.use('/api/materials', materialsRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/quiz', quizRoutes);
app.use('/api/course', courseRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'PMC Backend running with MongoDB' });
});

app.listen(PORT, () => {
  console.log(`PMC Backend → http://localhost:${PORT}`);
});
