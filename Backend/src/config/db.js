const mongoose = require('mongoose');
const env = require('./env');

const connectDB = async (customUri = null) => {
  const uri = customUri || env.mongodbUri;
  try {
    const conn = await mongoose.connect(uri, {
      autoIndex: true,
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`[Database] MongoDB Connected: ${conn.connection.host}/${conn.connection.name}`);
    return conn;
  } catch (error) {
    console.error(`[Database Error] Failed to connect to MongoDB: ${error.message}`);
    throw error;
  }
};

const disconnectDB = async () => {
  try {
    await mongoose.connection.close();
    console.log('[Database] MongoDB connection closed.');
  } catch (error) {
    console.error(`[Database Error] Disconnection error: ${error.message}`);
  }
};

module.exports = {
  connectDB,
  disconnectDB,
};

