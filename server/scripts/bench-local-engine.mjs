// Benchmark thời gian compile + run C++ qua Docker, giống hệt lệnh JudgeService dùng.
// Đo riêng phần Docker (không qua BullMQ/Mongo) để biết "sàn" thời gian của 1 submission.
// Cách chạy (Docker Desktop phải đang chạy, image gcc:latest đã pull):
//   cd server
//   node scripts/bench-local-engine.mjs            # 10 lần
//   node scripts/bench-local-engine.mjs 30         # 30 lần
// Kết quả: avg / p50 / p95 / min / max cho compile, run, total (ms).

import { exec } from 'node:child_process';
import { promisify } from 'node:util';
import fs from 'node:fs';
import path from 'node:path';

const execAsync = promisify(exec);
const iterations = Number(process.argv[2] ?? 10);

const tempDir = path.join(process.cwd(), 'local_compiler_tmp');
fs.mkdirSync(tempDir, { recursive: true });
const dockerVolumePath = tempDir.replace(/\\/g, '/');
const dockerCommand = `docker run --rm -v "${dockerVolumePath}:/app" -w /app`;

const source = `#include <bits/stdc++.h>
using namespace std;
int main(){ long long a,b; cin>>a>>b; cout<<a+b<<"\\n"; return 0; }
`;
const input = '3 4\n';

const stats = (arr) => {
  const s = [...arr].sort((a, b) => a - b);
  const pick = (p) => s[Math.min(s.length - 1, Math.floor(p * s.length))];
  return {
    avg: Math.round(s.reduce((x, y) => x + y, 0) / s.length),
    p50: Math.round(pick(0.5)),
    p95: Math.round(pick(0.95)),
    min: Math.round(s[0]),
    max: Math.round(s[s.length - 1]),
  };
};

const compileTimes = [];
const runTimes = [];
const totalTimes = [];

// Warm-up: lần đầu Docker Desktop thường chậm hơn hẳn, không tính vào thống kê.
console.log('Warm-up...');
await execAsync(`${dockerCommand} gcc:latest g++ --version`, {
  timeout: 60000,
});

for (let i = 1; i <= iterations; i += 1) {
  const id = `bench_${Date.now()}_${i}`;
  const src = path.join(tempDir, `main_${id}.cpp`);
  const exe = path.join(tempDir, `program_${id}`);
  const inp = path.join(tempDir, `input_${id}.txt`);

  const t0 = performance.now();
  fs.writeFileSync(src, source);
  fs.writeFileSync(inp, input);

  const c0 = performance.now();
  await execAsync(
    `${dockerCommand} gcc:latest g++ main_${id}.cpp -std=c++17 -O2 -o program_${id}`,
    { timeout: 10000, maxBuffer: 1024 * 1024 },
  );
  const compileMs = performance.now() - c0;

  const r0 = performance.now();
  const { stdout } = await execAsync(
    `${dockerCommand} --network=none gcc:latest sh -c "./program_${id} < input_${id}.txt"`,
    { timeout: 5000, maxBuffer: 1024 * 1024 },
  );
  const runMs = performance.now() - r0;

  for (const f of [src, exe, inp]) {
    try {
      fs.unlinkSync(f);
    } catch {
      /* ignore */
    }
  }
  const totalMs = performance.now() - t0;

  if (stdout.trim() !== '7') {
    console.warn(`  [${i}] unexpected output: ${JSON.stringify(stdout)}`);
  }

  compileTimes.push(compileMs);
  runTimes.push(runMs);
  totalTimes.push(totalMs);
  console.log(
    `  [${i}/${iterations}] compile=${Math.round(compileMs)}ms run=${Math.round(runMs)}ms total=${Math.round(totalMs)}ms`,
  );
}

console.log('\nResults (ms):');
console.table({
  compile: stats(compileTimes),
  run: stats(runTimes),
  total: stats(totalTimes),
});
