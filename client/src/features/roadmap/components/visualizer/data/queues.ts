import { cell, type VisualizerData } from "../types";

/** QU01 - Mô phỏng cơ chế hàng đợi giao dịch cơ bản */
export const queueTransactions: VisualizerData = {
  title: "Hàng đợi giao dịch (FIFO)",
  codeSnippet: [
    "class Queue {",
    "  constructor() { this.items = []; }",
    "  enqueue(x) { this.items.push(x); }      // vào CUỐI",
    "  dequeue()   { return this.items.shift(); } // ra ĐẦU",
    "  front()     { return this.items[0]; }",
    "  isEmpty()   { return this.items.length === 0; }",
    "}",
  ],
  steps: [
    {
      description:
        "Hàng đợi (Queue) hoạt động theo nguyên tắc FIFO — vào trước, ra trước, giống hệt việc xếp hàng ở quầy giao dịch.\nHai phép cơ bản: enqueue (thêm vào CUỐI) và dequeue (lấy ra từ ĐẦU).\nHàng đợi đang rỗng.",
      queue: [],
      queueLabel: "Hàng đợi giao dịch",
      variables: { "số giao dịch": 0 },
      codeLine: 1,
    },
    {
      description: "Giao dịch GD1 tới → enqueue(GD1). Nó vừa là front vừa là rear.",
      queue: [cell("GD1", "active")],
      queueLabel: "Hàng đợi giao dịch",
      variables: { front: "GD1", rear: "GD1" },
      codeLine: 2,
    },
    {
      description:
        "GD2 tới → enqueue(GD2), xếp vào CUỐI hàng. GD1 vẫn ở đầu và sẽ được xử lý trước.",
      queue: [cell("GD1"), cell("GD2", "active")],
      queueLabel: "Hàng đợi giao dịch",
      variables: { front: "GD1", rear: "GD2" },
      codeLine: 2,
    },
    {
      description: "GD3 tới → enqueue(GD3). Hàng đợi: GD1, GD2, GD3.",
      queue: [cell("GD1"), cell("GD2"), cell("GD3", "active")],
      queueLabel: "Hàng đợi giao dịch",
      variables: { front: "GD1", rear: "GD3", "độ dài": 3 },
      codeLine: 2,
    },
    {
      description:
        "Hệ thống rảnh → dequeue() lấy GD1 ra XỬ LÝ, vì nó tới sớm nhất. GD2 tự động trở thành front.\nĐây là điểm bảo đảm CÔNG BẰNG: ai tới trước được phục vụ trước.",
      queue: [cell("GD2", "active"), cell("GD3")],
      queueLabel: "Hàng đợi giao dịch",
      variables: { "đang xử lý": "GD1", front: "GD2" },
      output: "GD1",
      outputLabel: "Đã xử lý",
      codeLine: 3,
    },
    {
      description:
        "Trong lúc đang xử lý thì GD4 tới → enqueue(GD4) vào cuối hàng. Việc thêm mới KHÔNG ảnh hưởng gì tới thứ tự của những giao dịch đang chờ.",
      queue: [cell("GD2"), cell("GD3"), cell("GD4", "active")],
      queueLabel: "Hàng đợi giao dịch",
      variables: { front: "GD2", rear: "GD4" },
      output: "GD1",
      outputLabel: "Đã xử lý",
      codeLine: 2,
    },
    {
      description: "dequeue() tiếp → xử lý GD2. Hàng đợi còn GD3, GD4.",
      queue: [cell("GD3", "active"), cell("GD4")],
      queueLabel: "Hàng đợi giao dịch",
      variables: { "đang xử lý": "GD2", front: "GD3" },
      output: "GD1 → GD2",
      outputLabel: "Đã xử lý",
      codeLine: 3,
    },
    {
      description:
        "Thứ tự xử lý luôn khớp thứ tự tới: GD1 → GD2 → GD3 → GD4.\nSo sánh với Stack (LIFO): nếu dùng stack thì GD4 sẽ được xử lý trước GD3 — giao dịch tới sớm có thể bị chờ mãi. Vì vậy mọi hệ thống xếp lượt, in ấn, xử lý tin nhắn đều dùng Queue.\nLƯU Ý HIỆU NĂNG: cài queue bằng mảng rồi dùng shift() khiến mỗi lần dequeue tốn O(n) vì phải dịch toàn bộ phần tử. Nên dùng danh sách liên kết, hoặc mảng vòng (circular buffer), hoặc giữ thêm chỉ số head — khi đó cả enqueue và dequeue đều là O(1).",
      queue: [cell("GD3"), cell("GD4")],
      queueLabel: "Hàng đợi giao dịch",
      output: "GD1 → GD2 → GD3 → GD4",
      outputLabel: "Thứ tự xử lý",
      codeLine: 3,
    },
  ],
};

const MAZE_ROWS = ["r0", "r1", "r2", "r3"];
const MAZE_COLS = ["c0", "c1", "c2", "c3", "c4"];

/** QU02 - Tìm đường trong mê cung ma trận bằng Queue (BFS) */
export const queueMaze: VisualizerData = {
  title: "Tìm đường ngắn nhất trong mê cung (BFS)",
  codeSnippet: [
    "const q = [[sr, sc]]; dist[sr][sc] = 0;",
    "while (q.length) {",
    "  const [r, c] = q.shift();",
    "  for (const [dr, dc] of [[1,0],[-1,0],[0,1],[0,-1]]) {",
    "    const nr = r + dr, nc = c + dc;",
    "    if (hợp lệ && không tường && chưa thăm) {",
    "      dist[nr][nc] = dist[r][c] + 1;",
    "      q.push([nr, nc]);",
    "    }",
    "  }",
    "}",
  ],
  steps: [
    {
      description:
        "Mê cung 4×5: ô xám là tường không đi được, xuất phát ở góc trên trái (r0, c0) và đích E ở góc dưới phải (r3, c4). Mỗi bước chỉ được đi lên/xuống/trái/phải.\nVì mọi bước đi có 'giá' bằng nhau (đều là 1) nên BFS là lựa chọn đúng: nó lan đều ra mọi hướng theo từng lớp, nên ô nào được chạm tới lần đầu chính là lúc đường tới đó ngắn nhất.\nSố trong ô = số bước ít nhất từ điểm xuất phát.",
      grid: {
        cells: [
          [0, ".", "#", ".", "."],
          [".", "#", ".", ".", "."],
          [".", ".", ".", "#", "."],
          ["#", ".", ".", ".", "E"],
        ],
        rowLabels: MAZE_ROWS,
        colLabels: MAZE_COLS,
        active: [[0, 0]],
        caption: "Ô xám = tường · E = đích cần tới",
      },
      queue: [cell("(0,0)", "active")],
      queueLabel: "Queue các ô cần xét",
      variables: { "bước": 0 },
      codeLine: 0,
    },
    {
      description:
        "Lấy (0,0) ra, xét 4 ô kề. Ô (0,1) và (1,0) đi được và chưa thăm → gán khoảng cách 1 rồi đẩy vào queue.\nLớp 1 gồm 2 ô.",
      grid: {
        cells: [
          [0, 1, "#", ".", "."],
          [1, "#", ".", ".", "."],
          [".", ".", ".", "#", "."],
          ["#", ".", ".", ".", "E"],
        ],
        rowLabels: MAZE_ROWS,
        colLabels: MAZE_COLS,
        visited: [[0, 0]],
        active: [
          [0, 1],
          [1, 0],
        ],
      },
      queue: [cell("(0,1)", "active"), cell("(1,0)", "active")],
      queueLabel: "Queue các ô cần xét",
      variables: { "bước": 1 },
      codeLine: 6,
    },
    {
      description:
        "Lấy (0,1) ra: bên phải là tường (0,2), bên dưới là tường (1,1) → không mở thêm được ô nào. Nhánh này BÍ.\nLấy (1,0) ra: mở được (2,0) với khoảng cách 2. Rồi từ (2,0) mở được (2,1) với khoảng cách 3.",
      grid: {
        cells: [
          [0, 1, "#", ".", "."],
          [1, "#", ".", ".", "."],
          [2, 3, ".", "#", "."],
          ["#", ".", ".", ".", "E"],
        ],
        rowLabels: MAZE_ROWS,
        colLabels: MAZE_COLS,
        visited: [
          [0, 0],
          [0, 1],
          [1, 0],
        ],
        active: [
          [2, 0],
          [2, 1],
        ],
      },
      queue: [cell("(2,1)", "active")],
      queueLabel: "Queue các ô cần xét",
      variables: { "bước": 3 },
      codeLine: 6,
    },
    {
      description:
        "Từ (2,1) mở ra hai hướng cùng lúc: sang phải (2,2) và xuống dưới (3,1), cả hai đều có khoảng cách 4.\nĐây chính là hình ảnh 'làn sóng lan ra' đặc trưng của BFS.",
      grid: {
        cells: [
          [0, 1, "#", ".", "."],
          [1, "#", ".", ".", "."],
          [2, 3, 4, "#", "."],
          ["#", 4, ".", ".", "E"],
        ],
        rowLabels: MAZE_ROWS,
        colLabels: MAZE_COLS,
        visited: [
          [0, 0],
          [0, 1],
          [1, 0],
          [2, 0],
          [2, 1],
        ],
        active: [
          [2, 2],
          [3, 1],
        ],
      },
      queue: [cell("(2,2)", "active"), cell("(3,1)", "active")],
      queueLabel: "Queue các ô cần xét",
      variables: { "bước": 4 },
      codeLine: 6,
    },
    {
      description:
        "Lớp 5: từ (2,2) mở lên (1,2); từ (2,2) hoặc (3,1) mở tới (3,2). Ô (2,3) là tường nên bị chặn.\nLưu ý ô (3,2) chỉ được gán MỘT lần với giá trị 5 — lần chạm đầu tiên luôn là ngắn nhất, nên lần sau gặp lại ta bỏ qua.",
      grid: {
        cells: [
          [0, 1, "#", ".", "."],
          [1, "#", 5, ".", "."],
          [2, 3, 4, "#", "."],
          ["#", 4, 5, ".", "E"],
        ],
        rowLabels: MAZE_ROWS,
        colLabels: MAZE_COLS,
        visited: [
          [0, 0],
          [0, 1],
          [1, 0],
          [2, 0],
          [2, 1],
          [2, 2],
          [3, 1],
        ],
        active: [
          [1, 2],
          [3, 2],
        ],
      },
      queue: [cell("(1,2)", "active"), cell("(3,2)", "active")],
      queueLabel: "Queue các ô cần xét",
      variables: { "bước": 5 },
      codeLine: 6,
    },
    {
      description: "Lớp 6: từ (1,2) mở sang (1,3); từ (3,2) mở sang (3,3).",
      grid: {
        cells: [
          [0, 1, "#", ".", "."],
          [1, "#", 5, 6, "."],
          [2, 3, 4, "#", "."],
          ["#", 4, 5, 6, "E"],
        ],
        rowLabels: MAZE_ROWS,
        colLabels: MAZE_COLS,
        visited: [
          [0, 0],
          [0, 1],
          [1, 0],
          [2, 0],
          [2, 1],
          [2, 2],
          [3, 1],
          [1, 2],
          [3, 2],
        ],
        active: [
          [1, 3],
          [3, 3],
        ],
      },
      queue: [cell("(1,3)", "active"), cell("(3,3)", "active")],
      queueLabel: "Queue các ô cần xét",
      variables: { "bước": 6 },
      codeLine: 6,
    },
    {
      description:
        "Lớp 7: từ (1,3) mở ra (0,3) và (1,4); từ (3,3) mở ra (3,4) — CHÍNH LÀ ĐÍCH!\nDừng ngay tại đây, khoảng cách ngắn nhất là 7 bước.",
      grid: {
        cells: [
          [0, 1, "#", 7, "."],
          [1, "#", 5, 6, 7],
          [2, 3, 4, "#", "."],
          ["#", 4, 5, 6, 7],
        ],
        rowLabels: MAZE_ROWS,
        colLabels: MAZE_COLS,
        visited: [
          [0, 0],
          [0, 1],
          [1, 0],
          [2, 0],
          [2, 1],
          [2, 2],
          [3, 1],
          [1, 2],
          [3, 2],
          [1, 3],
          [3, 3],
        ],
        active: [
          [0, 3],
          [1, 4],
        ],
        found: [[3, 4]],
      },
      queue: [],
      queueLabel: "Queue các ô cần xét",
      variables: { "bước": 7, "tới đích": true },
      output: "7",
      outputLabel: "Số bước ít nhất",
      codeLine: 6,
    },
    {
      description:
        "Truy vết ngược từ đích, mỗi lần chọn ô kề có khoảng cách nhỏ hơn 1 đơn vị, ta được đường đi:\n(0,0) → (1,0) → (2,0) → (2,1) → (3,1) → (3,2) → (3,3) → (3,4)\nĐộ phức tạp O(hàng × cột) vì mỗi ô vào queue tối đa một lần.\nLỖI HAY GẶP: nếu dùng DFS cho bài này, ta vẫn TÌM ĐƯỢC đường nhưng không đảm bảo NGẮN NHẤT.",
      grid: {
        cells: [
          [0, 1, "#", 7, "."],
          [1, "#", 5, 6, 7],
          [2, 3, 4, "#", "."],
          ["#", 4, 5, 6, 7],
        ],
        rowLabels: MAZE_ROWS,
        colLabels: MAZE_COLS,
        found: [
          [0, 0],
          [1, 0],
          [2, 0],
          [2, 1],
          [3, 1],
          [3, 2],
          [3, 3],
          [3, 4],
        ],
        caption: "Đường đi ngắn nhất: 7 bước",
      },
      output: "7",
      outputLabel: "Số bước ít nhất",
      codeLine: 10,
    },
  ],
};

/** QU03 - Sinh số nhị phân từ 1 đến N bằng Queue */
export const queueBinaryNumbers: VisualizerData = {
  title: "Sinh số nhị phân từ 1 đến N bằng Queue",
  codeSnippet: [
    'const q = ["1"]; const out = [];',
    "for (let i = 0; i < n; i++) {",
    "  const s = q.shift();",
    "  out.push(s);",
    '  q.push(s + "0");',
    '  q.push(s + "1");',
    "}",
    "return out;",
  ],
  steps: [
    {
      description:
        'Yêu cầu: in ra biểu diễn nhị phân của các số từ 1 tới N = 5, tức là 1, 10, 11, 100, 101.\nMẹo rất đẹp: nếu s là nhị phân của x thì s + "0" là của 2x và s + "1" là của 2x + 1.\nVì vậy chỉ cần bắt đầu với "1" trong queue, mỗi lần lấy một chuỗi ra thì sinh ra hai chuỗi con. Queue bảo đảm thứ tự tăng dần vì 2x và 2x+1 luôn lớn hơn x.',
      queue: [cell("1", "active")],
      queueLabel: "Queue chuỗi nhị phân",
      output: "",
      outputLabel: "Kết quả",
      variables: { n: 5, "đã in": 0 },
      codeLine: 0,
    },
    {
      description:
        'Lấy "1" ra khỏi đầu queue → in ra (đây là số 1).\nSinh hai chuỗi con: "1" + "0" = "10" (số 2) và "1" + "1" = "11" (số 3), đẩy vào cuối queue.',
      queue: [cell("10", "active"), cell("11", "active")],
      queueLabel: "Queue chuỗi nhị phân",
      output: "1",
      outputLabel: "Kết quả",
      variables: { "đã in": 1 },
      codeLine: 5,
    },
    {
      description:
        'Lấy "10" ra → in ra (số 2). Sinh "100" (số 4) và "101" (số 5), đẩy vào CUỐI queue.\nQueue lúc này: 11, 100, 101 — chú ý "11" vẫn đứng trước vì nó vào queue sớm hơn, nên số 3 sẽ được in trước số 4. Đó là điều đảm bảo thứ tự đúng.',
      queue: [cell("11"), cell("100", "active"), cell("101", "active")],
      queueLabel: "Queue chuỗi nhị phân",
      output: "1, 10",
      outputLabel: "Kết quả",
      variables: { "đã in": 2 },
      codeLine: 5,
    },
    {
      description:
        'Lấy "11" ra → in ra (số 3). Sinh "110" (số 6) và "111" (số 7) đẩy vào queue — dù ta sẽ không dùng tới chúng vì N chỉ là 5.',
      queue: [
        cell("100"),
        cell("101"),
        cell("110", "active"),
        cell("111", "active"),
      ],
      queueLabel: "Queue chuỗi nhị phân",
      output: "1, 10, 11",
      outputLabel: "Kết quả",
      variables: { "đã in": 3 },
      codeLine: 5,
    },
    {
      description: 'Lấy "100" ra → in ra (số 4). Đã in được 4 số.',
      queue: [cell("101", "active"), cell("110"), cell("111"), cell("1000"), cell("1001")],
      queueLabel: "Queue chuỗi nhị phân",
      output: "1, 10, 11, 100",
      outputLabel: "Kết quả",
      variables: { "đã in": 4 },
      codeLine: 3,
    },
    {
      description:
        'Lấy "101" ra → in ra (số 5). Đã đủ N = 5 số nên vòng lặp dừng, phần còn lại trong queue bị bỏ.',
      queue: [cell("110"), cell("111"), cell("1000"), cell("1001")],
      queueLabel: "Queue chuỗi nhị phân",
      output: "1, 10, 11, 100, 101",
      outputLabel: "Kết quả",
      variables: { "đã in": 5 },
      codeLine: 3,
    },
    {
      description:
        "Hoàn thành! Kết quả: 1, 10, 11, 100, 101 — đúng là nhị phân của 1 đến 5.\nThời gian O(n), bộ nhớ O(n) cho queue.\nĐiểm hay của cách này: không dùng phép chia lấy dư hay chuyển đổi cơ số nào cả — hoàn toàn dựa vào cấu trúc cây nhị phân ngầm, mà BFS trên cây đó chính là quét theo thứ tự tăng dần.",
      queue: [cell("110"), cell("111"), cell("1000"), cell("1001")],
      queueLabel: "Queue (phần còn lại không dùng)",
      output: "1, 10, 11, 100, 101",
      outputLabel: "Kết quả",
      codeLine: 7,
    },
  ],
};
