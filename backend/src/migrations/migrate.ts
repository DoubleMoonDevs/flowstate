import fs from 'fs';
import path from 'path';
import { db } from '../db';

const migrationsDir = path.join(__dirname);
const files = fs.readdirSync(migrationsDir).filter((f) => f.endsWith('.sql')).sort();

for (const file of files) {
  const fullPath = path.join(migrationsDir, file);
  const sql = fs.readFileSync(fullPath, 'utf8');
  db.exec(sql);
  console.log(`Applied migration: ${file}`);
}

console.log('Migrations complete.');
