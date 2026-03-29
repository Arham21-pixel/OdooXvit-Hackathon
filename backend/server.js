const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// Load env vars
dotenv.config();

const app = express();

// Body parser
app.use(express.json());

// Enable CORS for frontend
app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
  credentials: true,
}));

// Mount routers (placeholders for now until you build them)
app.use('/api/auth', require('./routes/auth.routes') || express.Router());
app.use('/api/users', require('./routes/user.routes') || express.Router());
app.use('/api/expenses', require('./routes/expense.routes') || express.Router());
app.use('/api/approvals', require('./routes/approval.routes') || express.Router());
app.use('/api/rules', require('./routes/rules.routes') || express.Router());
app.use('/api/ocr', require('./routes/ocr.routes') || express.Router());

// Basic error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, error: 'Server Error' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, console.log(`Server running on port ${PORT}`));
