const express = require('express');
const connectDB = require('./src/configs/db');
const morgan = require('morgan');

const dotenv = require('dotenv');
dotenv.config();

const app = express();
const userRoutes = require('./src/routes/user.routes');


const PORT = process.env.PORT;


app.use(express.json());
app.use(morgan('dev'));

connectDB();

app.get('/', (req, res) => {
  res.send("Hello World");
});

app.use('/api/users', userRoutes);

const productRoutes = require('./src/routes/product.routes');
app.use('/api/products', productRoutes);


app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});