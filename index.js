const express = require('express');
const dotenv = require('dotenv');
dotenv.config();

const connectDB = require('./src/configs/db');
connectDB();

const app = express();
app.use(express.json());

const userRoutes = require('./src/routes/user.routes');
app.use('/api/users', userRoutes);

const productRoutes = require('./src/routes/product.routes');
app.use('/api/products', productRoutes);

const PORT = process.env.PORT || 7000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});