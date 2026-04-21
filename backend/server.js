const express = require('express');
const cors = require('cors');
const path = require('path');
const { connectMongo, createDbAdapter } = require('./db/mongoAdapter');
require('dotenv').config({ path: path.join(__dirname, 'config.env') });

const REQUIRED_ENV = ['MONGODB_URI', 'MONGODB_DB_NAME', 'SECRET_KEY'];
const missingEnv = REQUIRED_ENV.filter((name) => !process.env[name] || !process.env[name].trim());

if (missingEnv.length > 0) {
  console.error(`Missing required env vars: ${missingEnv.join(', ')}`);
  process.exit(1);
}

const app = express();
const PORT = Number(process.env.PORT) || 3000;

// Middleware
app.use(cors());
app.use(express.json());

app.get('/health', (request, response) => {
  response.status(200).json({
    status: 'ok',
    service: 'smart-mech-backend',
  });
});

const routeModules = [
  './Routes/userRoutes',
  './Routes/chap2Routes',
  './Routes/chap3Routes',
  './Routes/chap4Routes',
  './Routes/chap5Routes',
  './Routes/historyRoutes',
];

async function startServer() {
  try {
    const { client, db } = await connectMongo(process.env.MONGODB_URI.trim(), process.env.MONGODB_DB_NAME.trim());
    const dbAdapter = createDbAdapter(db);

    app.use((request, response, next) => {
      request.db = dbAdapter;
      request.mongoDb = db;
      next();
    });

    routeModules.forEach((modulePath) => {
      const route = require(modulePath);
      app.use(route);
    });

    app.listen(PORT, () => {
      console.log(`Server is running on port: ${PORT}`);
      console.log(`MongoDB connected: ${process.env.MONGODB_DB_NAME.trim()}`);
    });

    process.on('SIGINT', async () => {
      await client.close();
      process.exit(0);
    });
  } catch (error) {
    console.error('MongoDB connection failed:', error.message);
    process.exit(1);
  }
}

startServer();
