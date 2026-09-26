# TIẾN TRÌNH TỐI ƯU PIPELINE CHẤM CODE

Ngày đo: 2026-09-12
Branch: `feature/algorithm-visualizer`

## 1. Pipeline hiện tại

```
Client POST /exercises/:id/submit
  -> ExerciseService tạo N Submission (1 per test case), status = pending
  -> CodeExecutionService.executeCode(): queue.add('execute', ...)   [BullMQ / Redis]
  -> CodeExecutionProcessor.process()                                 [worker, concurrency = 1]
       -> JudgeService.runCode()
            -> docker run gcc:latest g++ main.cpp -O2      (compile)
            -> docker run --network=none gcc:latest ./program < input   (run, timeout 2000ms)
       -> submission.save()  (output, status, runtime, memory, timings)
Client poll GET /code-execution/:id  mỗi 1200ms, tối đa 15 lần (= 18s)
```

## 2. Số liệu đo được (TRƯỚC khi tối ưu)

Môi trường: Windows 11, Docker Desktop 29.3.1 (WSL2), image `gcc:latest`.
Chương trình test: a+b, có `#include <bits/stdc++.h>`, input `3 4`.
Cách đo: `node server/scripts/bench-local-engine.mjs 10` (1 lần warm-up không tính).

| Giai đoạn                              | avg (ms) | p50  | p95  | min  | max  |
|----------------------------------------|----------|------|------|------|------|
| Compile (docker run + g++ -O2)         | 3780     | 3826 | 4207 | 3328 | 4207 |
| Run (docker run + chạy program)        | 723      | 648  | 927  | 596  | 927  |
| Tổng phần Docker cho 1 submission      | 4510     | 4617 | 4930 | 3953 | 4930 |

Chi tiết 10 lần chạy:

```
[1]  compile=4207 run=637 total=4848
[2]  compile=3761 run=647 total=4414
[3]  compile=3735 run=903 total=4645
[4]  compile=3974 run=636 total=4617
[5]  compile=3998 run=927 total=4930
[6]  compile=3328 run=608 total=3953
[7]  compile=3826 run=596 total=4428
[8]  compile=3452 run=851 total=4309
[9]  compile=3661 run=648 total=4316
[10] compile=3854 run=782 total=4642
```

Phần BullMQ nhận job + đọc/ghi Mongo: vài chục ms khi queue rảnh (chưa đo chính xác,
sẽ có số thật trong field `timings.queueWaitMs` / `timings.processMs` sau khi chạy server).

**Kết luận: ~4,5 giây / submission, trong đó chương trình thật chỉ chạy vài ms.**

## 3. Phân tích bottleneck

1. **Khởi động container Docker chiếm phần lớn thời gian.**
   Mỗi submission gọi `docker run` 2 lần, mỗi lần tốn ~600–900ms chỉ để tạo container.
2. **g++ -O2 với `bits/stdc++.h` tốn ~2,5–3s.** Header này rất nặng, không có precompiled header.
3. **Worker chạy tuần tự (concurrency = 1).**
   Submit N test case = N job chạy nối tiếp. 5 test case ≈ 22s.
4. **Client poll tối đa 18s** (`MAX_POLL_ATTEMPTS = 15`, `POLL_INTERVAL_MS = 1200`
   trong `client/src/features/editor/components/CodeLayout.tsx`).
   => Submit từ 4 test case trở lên sẽ báo "still processing" dù backend vẫn chạy đúng.
5. **Timeout run 2000ms đã bao gồm thời gian khởi động container**, nên chương trình của
   user thực chất chỉ còn ~1,1s CPU. Giá trị `runtime` lưu vào Mongo bị cộng thêm
   ~600–900ms overhead của Docker, không phản ánh thời gian chạy thật.

## 4. Việc cần làm (checklist)

Ưu tiên theo hiệu quả / công sức:

- [ ] **Gộp compile + run vào 1 lần `docker run`** (bỏ 1 lần khởi động container, tiết kiệm ~0,6–0,9s).
      Dùng `sh -c "g++ ... && ./program < input"` trong cùng container. Cần tách compile error
      và runtime error bằng exit code hoặc marker trong stderr.
- [ ] **Giữ 1 container gcc chạy sẵn, dùng `docker exec`** thay vì `docker run` mỗi lần.
      Bỏ gần hết overhead khởi động (kỳ vọng tổng < 1,5s). Cần xử lý cleanup file trong container
      và giới hạn tài nguyên (`--memory`, `--cpus`, `--pids-limit`).
- [ ] **Precompiled header cho `bits/stdc++.h`** (build image riêng có sẵn `stdc++.h.gch`),
      kỳ vọng compile giảm từ ~3s xuống < 1s.
- [ ] **Bật concurrency cho worker**: `@Processor('code-execution', { concurrency: 3 })`
      để các test case chạy song song. Cân nhắc RAM máy khi chạy nhiều container.
- [ ] **Tách timeout của chương trình khỏi timeout của Docker**: dùng `timeout 1s ./program`
      bên trong container, giữ timeout ngoài (`execAsync`) lớn hơn.
- [ ] **Tăng `MAX_POLL_ATTEMPTS` ở client** (hoặc tính theo số test case) để không báo lỗi sớm.
- [ ] Đo lại sau mỗi bước bằng `bench-local-engine.mjs 30` và ghi vào mục 5.
- [ ] Chạy vài submission thật qua server rồi `node scripts/submission-timing-stats.mjs`
      để có số queueWait / endToEnd thực tế.

## 5. Số liệu SAU khi tối ưu (điền sau)

| Bước tối ưu                          | compile avg | run avg | total avg | total p95 | Ghi chú |
|--------------------------------------|-------------|---------|-----------|-----------|---------|
| Baseline (mục 2)                     | 3780        | 723     | 4510      | 4930      |         |
| Gộp compile + run 1 container        |             |         |           |           |         |
| docker exec container dùng lại       |             |         |           |           |         |
| Precompiled header                   |             |         |           |           |         |
| Concurrency = 3 (đo endToEnd 5 TC)   |             |         |           |           |         |

## 6. Cách đo lại

```bash
# Docker Desktop phải đang chạy
cd server

# Đo riêng phần Docker (không qua BullMQ / Mongo), N lần, in avg/p50/p95/min/max
node scripts/bench-local-engine.mjs 30

# Thống kê timings thật từ các submission đã chạy qua server (đọc field `timings` trong Mongo)
node scripts/submission-timing-stats.mjs 200
```

Khi server chạy, mỗi submission xong sẽ log 1 dòng:

```
[CodeExecution] Submission <id> finished with status success | queueWait=..ms compile=..ms run=..ms engine=..ms process=..ms endToEnd=..ms
```

Các field trong `Submission.timings`:

| Field          | Ý nghĩa                                                         |
|----------------|-----------------------------------------------------------------|
| queueWaitMs    | Từ lúc `queue.add()` đến lúc worker bắt đầu `process()`         |
| compileMs      | `docker run ... g++` (gồm cả khởi động container)               |
| runMs          | `docker run ... ./program` (gồm cả khởi động container)         |
| engineTotalMs  | Ghi file + compile + run + dọn file                             |
| processMs      | Toàn bộ `process()`: findById + engine + save                   |
| endToEndMs     | queueWaitMs + processMs                                         |

## 7. Files đã thay đổi cho việc đo

- `server/src/judge0/judge.service.ts` – đo compileMs / runMs / engineTotalMs
- `server/src/code-execution/code-execution.processor.ts` – đo queueWaitMs / processMs / endToEndMs, log tổng hợp
- `server/src/code-execution/schema/submission.schema.ts` – thêm field `timings`
- `server/src/interfaceFile/interface.ts` – type `ExecutionTimings`, `SubmissionTimings`
- `server/scripts/bench-local-engine.mjs` – benchmark Docker
- `server/scripts/submission-timing-stats.mjs` – thống kê từ Mongo

## 8. Mẫu câu cho CV (điền số sau khi tối ưu)

- Thiết kế pipeline chấm code C++ bất đồng bộ (NestJS, BullMQ, Redis, Docker sandbox có cô lập mạng và giới hạn thời gian).
- Bổ sung đo latency từng giai đoạn (queue wait, compile, run, end-to-end) lưu vào MongoDB kèm script thống kê p50/p95.
- Phát hiện overhead khởi động container chiếm > 80% thời gian chấm; tối ưu bằng container dùng lại và precompiled header,
  giảm thời gian trung bình mỗi submission từ 4,5s xuống __s (p95 __s), tương đương giảm __%.
