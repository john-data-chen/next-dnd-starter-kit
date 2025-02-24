import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// 使用 ES modules 時正確解析 .env 文件路徑
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const prisma = new PrismaClient();

async function main() {
  console.log('DATABASE_URL:', process.env.DATABASE_URL);

  if (!process.env.DATABASE_URL) {
    console.error('找不到 DATABASE_URL 環境變數！');
    process.exit(1);
  }

  try {
    const newUser = await prisma.user.create({
      data: {
        email: 'admin@example.com',
        name: 'admin',
        password: await bcrypt.hash('123456', 10),
        role: 'ADMIN'
      }
    });
    console.log('Created admin user:', newUser);
  } catch (error) {
    if (error.code === 'P2002') {
      console.log('用戶已存在');
    } else {
      throw error;
    }
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });