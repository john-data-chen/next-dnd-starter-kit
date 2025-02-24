import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';

// 使用 ES modules 時正確解析 .env 文件路徑
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// 定義用戶 Schema
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['ADMIN', 'USER'], default: 'USER' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);

async function main() {
  try {
    // 連接到 MongoDB
    await mongoose.connect(process.env.DATABASE_URL);
    console.log('成功連接到 MongoDB');

    // 創建管理員用戶
    const adminUser = await User.create({
      email: 'admin@example.com',
      name: 'admin',
      password: await bcrypt.hash('123456', 10),
      role: 'ADMIN'
    });

    console.log('創建管理員用戶成功:', adminUser);
  } catch (error) {
    if (error.code === 11000) {
      console.log('用戶已存在');
    } else {
      console.error('錯誤:', error);
    }
  } finally {
    await mongoose.disconnect();
    console.log('已斷開 MongoDB 連接');
  }
}

main().catch(console.error);

