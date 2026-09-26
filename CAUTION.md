1. CAUTION – Những điểm cần chú ý khi đi phỏng vấn

> Đối chiếu từ CV `NguyenThanhLuan_BackenDeveloper_Intern.pdf` và code thực tế trong repo CodeQuest.

---

## 1. Việc cần làm ngay trước khi gửi / mang CV

- [X] **Tên file bị sai chính tả**: `BackenDeveloper` thiếu chữ "d". Đổi thành `NguyenThanhLuan_BackendDeveloper_Intern.pdf`.
- [X] **Kiểm tra link GitHub | Product** của cả 3 project có mở được không. Interviewer thường click ngay trong lúc phỏng vấn.
- [X] **Thời gian overlap**: Gender Insights (Oct 2025 – Apr 2026) trùng với CodeQuest (Feb – Jul 2026). Chuẩn bị câu trả lời về cách cân đối 2 project cùng lúc với việc học.

---

## 2. CodeQuest – DSA Learning Platform (project quan trọng nhất)

Project team 5 người. Interviewer sẽ hỏi rất kỹ **"bạn làm phần nào, đồng đội làm phần nào"**. Nói thật, nêu rõ module mình own.

### 2.1. Những chỗ CV viết "đẹp" hơn code thực tế

| CV ghi                    | Code thực tế                                                                                                                                                 | Cách trả lời                                                                                                                                                                                        |
| ------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Judging pipeline, Docker  | Chỉ hỗ trợ**C++** qua image `gcc:latest`, dù có `JUDGE0_LANGUAGE_MAP`                                                                           | Đừng nói đa ngôn ngữ. Nói "thiết kế sẵn map để mở rộng, hiện mới ship C++".                                                                                                            |
| Folder tên`judge0`     | **Không dùng Judge0**, engine Docker tự viết                                                                                                         | Ban đầu định dùng Judge0, sau chuyển sang engine tự viết nhưng giữ nguyên interface response để không phải sửa controller. Nêu lý do (chi phí, self-host phức tạp…).             |
| "network and time limits" | `--network=none` chỉ ở bước **run**, bước **compile** thì không. Timeout 2s là của `execAsync` phía host, không phải của Docker. | Thừa nhận và nêu hướng cải thiện.                                                                                                                                                              |
| Isolated containers       | **Không có giới hạn memory**, `memory: 2048` là hardcode                                                                                          | Nếu hỏi "làm sao ngăn code chiếm hết RAM": nêu`--memory`, `--cpus`, `--pids-limit`, `timeout` trong container, chạy user không phải root.                                            |
| Isolated containers       | Cả thư mục`local_compiler_tmp` được mount vào container → submission A có thể đọc file của submission B đang chạy song song                   | Biết điểm này và nói cách fix: mount thư mục riêng cho từng job, hoặc pipe code qua stdin. Rất ăn điểm.                                                                                |
| Time limit                | Timeout của`execAsync` kill tiến trình docker CLI, **chưa chắc kill container**                                                                   | Chuẩn bị nếu bị hỏi "TLE thì container có bị dọn không". Hướng fix:`docker run --stop-timeout`, hoặc dùng `timeout` bên trong container, hoặc `docker kill` theo tên container. |

File liên quan: `server/src/judge0/judge.service.ts`, `server/src/code-execution/code-execution.processor.ts`.

### 2.2. Các phần khác cần nắm chắc

- **Test-case backup trên Cloudflare R2** (`server/src/shared/r2.service.ts`): vì sao dùng R2 thay vì lưu trong MongoDB (kích thước file, chi phí egress = 0, tương thích S3 API).
- **Thinking Mirror**: cách inject code / verdict / error của learner vào prompt; **chống prompt injection** thế nào khi code của user đi vào prompt; Socratic hint khác full solution ở đâu; session scored lưu schema gì.
- **Roadmap**: validate JSON từ Gemini bằng gì (schema, thư viện); fallback rule-based hoạt động ra sao; map từ plan sang challenge thật thế nào.
- **Auth**: access token vs refresh token; "account matching" nghĩa là gì (cùng email từ Google và GitHub thì gộp account); guard RBAC đặt ở đâu; bcrypt cost factor bao nhiêu.
- **BullMQ**: job fail retry thế nào, idempotent không; Redis chết thì sao; concurrency của worker; vì sao không xử lý sync.
- **MongoDB**: schema embed hay reference; index gì; vì sao chọn Mongo thay vì Postgres cho project này.

### 2.3. Câu hỏi hay gặp

- Vì sao dùng BullMQ thay vì xử lý sync?
- Job fail thì retry thế nào? Có idempotent không?
- Redis chết thì hệ thống ra sao?
- Nếu làm lại CodeQuest bạn sẽ thay đổi gì? → trả lời bằng mục 2.1 (isolation, memory limit, kill container).
- Khó khăn kỹ thuật lớn nhất và cách giải quyết?

---

## 3. LuluTrello – Real-time Kanban with AI & Zalo Assistant

CV ghi rõ build bằng **Claude Code** → con dao hai lưỡi. Interviewer sẽ kiểm tra có thực sự hiểu code không.

- Giải thích **tự tay** luồng RBAC: guard đọc role từ đâu, check ownership ở request nào, 4 role (owner / leader / member / viewer) khác nhau quyền gì.
- "Global DTO whitelisting" = `ValidationPipe({ whitelist: true })`. Biết `forbidNonWhitelisted` khác gì.
- **Socket.IO rooms**: join room theo `boardId`; auth cho socket handshake thế nào; xử lý reconnect.
- **Signed URL trên R2**: sống bao lâu; vì sao không để bucket public; check quyền trước khi ký URL ở đâu.
- **AI slide generator**: extract text PDF/DOCX/XLSX bằng thư viện gì; export `.pptx` bằng gì; fallback rule-based khi Gemini lỗi.
- **Zalo bot**: exponential backoff cài thế nào (base delay, max retry); batch alert theo cửa sổ thời gian nào; Firestore Q&A query ra sao.
- Kể được **ít nhất 1 chỗ AI sinh code sai và mình phải sửa**. Đây là điểm mạnh nếu kể tốt.

---

## 4. Gender Insights – Gender Education Platform

Có 3 con số rất mạnh, interviewer chắc chắn hỏi **"đo bằng gì"**:

| Claim                        | Cần trả lời được                                                                                                |
| ---------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| DB CPU 95% → 30%            | Đo ở đâu (pg_stat_statements, htop, dashboard hosting)? Phát hiện N+1 bằng gì (log query, Sequelize logging)? |
| Response 500ms → 150ms      | Tool benchmark (autocannon, k6, ab)? p50 hay p95? Đo trên endpoint nào?                                            |
| 100 → 150+ concurrent users | Định nghĩa "concurrent" thế nào? Instance cấu hình ra sao (CPU/RAM)?                                           |

- Nếu con số là ước lượng thì **nói thẳng là ước lượng** và kể cách quan sát. Đừng để bị dồn.
- LRU caching: cache cái gì, key là gì, invalidate khi nào.
- Connection pool tuned: từ bao nhiêu lên bao nhiêu, vì sao chọn số đó.
- Fastify vs Express: vì sao chọn Fastify.

---

## 5. Kỹ năng và các phần khác trong CV

- **"AI Agents" và "Prompt Engineering"** khá chung chung. Chuẩn bị 1 ví dụ cụ thể cho mỗi cái, không thì bỏ khỏi CV.
- **Java** trong Languages nhưng không có project nào dùng. Sẵn sàng bị hỏi Java cơ bản (OOP, collections) hoặc bỏ đi.
- **React** trong skill nhưng apply Backend. Chỉ là điểm cộng, không cần đào sâu.
- **SQL**: chuẩn bị JOIN, index, transaction, N+1 (liên quan trực tiếp Gender Insights).
- **TOEIC 650**: một số công ty phỏng vấn kỹ thuật bằng tiếng Anh. Luyện phần giới thiệu bản thân và mô tả CodeQuest bằng tiếng Anh trong 2 phút.
- **GDG Cloud facilitator**: câu hỏi mềm dễ gặp. Chuẩn bị 1 câu chuyện ngắn về lần giúp attendee deploy.
- **Giải Ba DevCamp 2026**: biết tiêu chí chấm và vì sao không đạt giải cao hơn → thể hiện khả năng tự đánh giá.
- **GPA 3.0, năm 2 (2024–2028)**: sẵn sàng câu hỏi về lịch học / thời gian intern có thể đi làm.

---

## 6. Checklist 2 câu trả lời phải có sẵn

1. **"Nếu làm lại CodeQuest bạn sẽ thay đổi gì?"**
   → Isolation từng job, giới hạn memory/CPU/pids, kill container đúng cách khi TLE, hỗ trợ thêm ngôn ngữ, test tự động cho pipeline.
2. **"Khó khăn kỹ thuật lớn nhất và cách giải quyết?"**
   → Chọn 1 trong: chuyển từ Judge0 sang engine Docker tự viết; xử lý Gemini trả JSON không hợp lệ và xây fallback; tối ưu N+1 ở Gender Insights.

---

## 7. Cấu trúc kể project (STAR rút gọn, ~2 phút / project)

1. **Bối cảnh**: project gì, team mấy người, vai trò của mình.
2. **Mình own phần nào**: nêu cụ thể module.
3. **Quyết định kỹ thuật + trade-off**: vì sao chọn X thay vì Y.
4. **Khó khăn + cách giải**: 1 ví dụ cụ thể.
5. **Kết quả + điều sẽ làm khác**: số liệu nếu có, và điểm còn thiếu.
