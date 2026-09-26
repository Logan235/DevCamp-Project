// Thống kê thời gian thực tế từ các Submission đã chạy qua BullMQ + worker
// (đọc field `timings` mà CodeExecutionProcessor lưu vào Mongo).
// Cách chạy:
//   cd server
//   node scripts/submission-timing-stats.mjs            # 200 submission gần nhất
//   node scripts/submission-timing-stats.mjs 1000
// Dùng MONGO_URL / MONGO_URI / MONGODB_URI trong server/.env (mặc định mongodb://localhost:27017/codequest).

import mongoose from 'mongoose';
import fs from 'node:fs';
import path from 'node:path';

const limit = Number(process.argv[2] ?? 200);

const envPath = path.join(process.cwd(), '.env');
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, 'utf-8').split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && !process.env[m[1]]) {
      process.env[m[1]] = m[2].replace(/^['"]|['"]$/g, '');
    }
  }
}

const uri =
  process.env.MONGO_URL ??
  process.env.MONGO_URI ??
  process.env.MONGODB_URI ??
  'mongodb://localhost:27017/codequest';

await mongoose.connect(uri);
const db = mongoose.connection.db;

const docs = await db
  .collection('submissions')
  .find({ timings: { $exists: true } })
  .sort({ createdAt: -1 })
  .limit(limit)
  .project({ timings: 1, status: 1 })
  .toArray();

if (docs.length === 0) {
  console.log('Chưa có submission nào có field `timings`. Hãy chạy vài submission trước.');
  await mongoose.disconnect();
  process.exit(0);
}

const fields = [
  'queueWaitMs',
  'compileMs',
  'runMs',
  'engineTotalMs',
  'processMs',
  'endToEndMs',
];

const stats = (arr) => {
  const s = arr.filter((v) => typeof v === 'number').sort((a, b) => a - b);
  if (s.length === 0) return { n: 0 };
  const pick = (p) => s[Math.min(s.length - 1, Math.floor(p * s.length))];
  return {
    n: s.length,
    avg: Math.round(s.reduce((x, y) => x + y, 0) / s.length),
    p50: pick(0.5),
    p95: pick(0.95),
    min: s[0],
    max: s[s.length - 1],
  };
};

const table = {};
for (const f of fields) {
  table[f] = stats(docs.map((d) => d.timings?.[f]));
}

console.log(`Submissions analysed: ${docs.length} (uri: ${uri})`);
console.table(table);

const byStatus = {};
for (const d of docs) byStatus[d.status] = (byStatus[d.status] ?? 0) + 1;
console.log('By status:', byStatus);

await mongoose.disconnect();
