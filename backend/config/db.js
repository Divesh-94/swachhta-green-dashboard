const mongoose = require('mongoose');
const net = require('net');
const path = require('path');
const { spawn } = require('child_process');
const fs = require('fs');

function isPortOpen(port, host = '127.0.0.1') {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    socket.setTimeout(1000);
    socket.on('connect', () => {
      socket.destroy();
      resolve(true);
    });
    socket.on('timeout', () => {
      socket.destroy();
      resolve(false);
    });
    socket.on('error', () => {
      resolve(false);
    });
    socket.connect(port, host);
  });
}

async function ensureMongoStarted() {
  const open = await isPortOpen(27018);
  if (!open) {
    const mongoExe = 'C:\\Program Files\\MongoDB\\Server\\8.3\\bin\\mongod.exe';
    const dbPath = path.resolve(__dirname, '..', 'data');
    if (!fs.existsSync(dbPath)) {
      fs.mkdirSync(dbPath, { recursive: true });
    }
    console.log('Starting MongoDB service on port 27018...');
    const child = spawn(mongoExe, ['--port', '27018', '--dbpath', dbPath], {
      detached: true,
      stdio: 'ignore',
    });
    child.unref();

    for (let i = 0; i < 15; i++) {
      await new Promise((r) => setTimeout(r, 1000));
      if (await isPortOpen(27018)) {
        console.log('MongoDB started successfully on port 27018.');
        return;
      }
    }
  }
}

const connectDB = async () => {
  try {
    const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27018/swachhta_green_dashboard';
    if (uri.includes(':27018')) {
      await ensureMongoStarted();
    }
    const conn = await mongoose.connect(uri);
    console.log(`MongoDB connected: ${conn.connection.host}`);
  } catch (err) {
    console.error(`MongoDB connection error: ${err.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
