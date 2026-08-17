import { cell, type GraphView, type NodeState, type VisualizerData } from "../types";

type Pos = { id: string; x: number; y: number };
type Link = { from: string; to: string; weight?: number };

/** Dựng khung đồ thị với trạng thái đỉnh/cạnh cho từng bước. */
function makeGraph(
  positions: Pos[],
  links: Link[],
  states: Record<string, NodeState> = {},
  badges: Record<string, string> = {},
  edgeStates: Record<string, NodeState> = {},
): GraphView {
  return {
    nodes: positions.map((p) => ({ ...p, state: states[p.id], badge: badges[p.id] })),
    edges: links.map((l) => ({
      ...l,
      state: edgeStates[`${l.from}-${l.to}`] ?? edgeStates[`${l.to}-${l.from}`],
    })),
  };
}

/* ----------------------- Đồ thị dùng cho BFS & DFS ----------------------- */

const TRAVERSE_POS: Pos[] = [
  { id: "A", x: 12, y: 20 },
  { id: "B", x: 45, y: 12 },
  { id: "C", x: 82, y: 18 },
  { id: "D", x: 16, y: 76 },
  { id: "E", x: 52, y: 66 },
  { id: "F", x: 88, y: 72 },
];

const TRAVERSE_LINKS: Link[] = [
  { from: "A", to: "B" },
  { from: "A", to: "D" },
  { from: "B", to: "C" },
  { from: "B", to: "E" },
  { from: "D", to: "E" },
  { from: "C", to: "F" },
  { from: "E", to: "F" },
];

const tg = (
  states: Record<string, NodeState>,
  badges: Record<string, string> = {},
  edges: Record<string, NodeState> = {},
) => makeGraph(TRAVERSE_POS, TRAVERSE_LINKS, states, badges, edges);

/** GRAPH01 - Duyệt đồ thị theo chiều rộng (BFS) */
export const graphBfs: VisualizerData = {
  title: "Duyệt đồ thị theo chiều rộng (BFS)",
  codeSnippet: [
    "const q = [start];",
    "visited.add(start);",
    "while (q.length) {",
    "  const u = q.shift();      // lấy từ ĐẦU queue",
    "  order.push(u);",
    "  for (const v of adj[u]) {",
    "    if (!visited.has(v)) {",
    "      visited.add(v);",
    "      q.push(v);",
    "    }",
    "  }",
    "}",
  ],
  steps: [
    {
      description:
        "BFS lan ra theo từng LỚP: thăm hết các đỉnh cách 1 bước, rồi mới tới các đỉnh cách 2 bước...\nCấu trúc bắt buộc là QUEUE (vào trước ra trước). Bắt đầu từ A: đưa A vào queue và đánh dấu đã thăm.\nDanh sách kề: A:[B,D] · B:[A,C,E] · C:[B,F] · D:[A,E] · E:[B,D,F] · F:[C,E]",
      graph: tg({ A: "active" }),
      queue: [cell("A", "active")],
      queueLabel: "Queue",
      output: "",
      outputLabel: "Thứ tự BFS",
      codeLine: 0,
    },
    {
      description:
        "Lấy A ra khỏi đầu queue và thăm nó. Xét các đỉnh kề của A là B và D — cả hai chưa thăm nên đánh dấu và đẩy vào cuối queue.\nQueue: [B, D]",
      graph: tg(
        { A: "found", B: "active", D: "active" },
        { A: "lớp 0", B: "lớp 1", D: "lớp 1" },
        { "A-B": "found", "A-D": "found" },
      ),
      queue: [cell("B", "active"), cell("D", "active")],
      queueLabel: "Queue",
      output: "A",
      outputLabel: "Thứ tự BFS",
      codeLine: 3,
    },
    {
      description:
        "Lấy B ra và thăm. Đỉnh kề của B: A đã thăm (bỏ qua), C và E chưa thăm → đẩy vào cuối queue.\nQueue: [D, C, E] — chú ý D vẫn đứng trước C, E vì D vào trước. Đó là lý do BFS đi hết lớp 1 trước khi sang lớp 2.",
      graph: tg(
        { A: "found", B: "found", D: "visited", C: "active", E: "active" },
        { B: "lớp 1", C: "lớp 2", E: "lớp 2" },
        { "A-B": "found", "A-D": "found", "B-C": "found", "B-E": "found" },
      ),
      queue: [cell("D", "visited"), cell("C", "active"), cell("E", "active")],
      queueLabel: "Queue",
      output: "A B",
      outputLabel: "Thứ tự BFS",
      codeLine: 8,
    },
    {
      description:
        "Lấy D ra và thăm. Đỉnh kề của D là A và E — cả hai đều đã được đánh dấu nên không đẩy thêm gì.\nQueue: [C, E]",
      graph: tg(
        { A: "found", B: "found", D: "found", C: "visited", E: "visited" },
        { D: "lớp 1" },
        { "A-B": "found", "A-D": "found", "B-C": "found", "B-E": "found" },
      ),
      queue: [cell("C", "visited"), cell("E", "visited")],
      queueLabel: "Queue",
      output: "A B D",
      outputLabel: "Thứ tự BFS",
      codeLine: 6,
    },
    {
      description:
        "Lấy C ra và thăm. Đỉnh kề F chưa thăm → đánh dấu và đẩy vào queue.\nQueue: [E, F]",
      graph: tg(
        { A: "found", B: "found", D: "found", C: "found", E: "visited", F: "active" },
        { C: "lớp 2", F: "lớp 3" },
        { "A-B": "found", "A-D": "found", "B-C": "found", "B-E": "found", "C-F": "found" },
      ),
      queue: [cell("E", "visited"), cell("F", "active")],
      queueLabel: "Queue",
      output: "A B D C",
      outputLabel: "Thứ tự BFS",
      codeLine: 8,
    },
    {
      description:
        "Lấy E ra và thăm. Các đỉnh kề B, D, F đều đã đánh dấu → không đẩy gì thêm.\nQueue: [F]",
      graph: tg(
        { A: "found", B: "found", D: "found", C: "found", E: "found", F: "visited" },
        { E: "lớp 2" },
        { "A-B": "found", "A-D": "found", "B-C": "found", "B-E": "found", "C-F": "found" },
      ),
      queue: [cell("F", "visited")],
      queueLabel: "Queue",
      output: "A B D C E",
      outputLabel: "Thứ tự BFS",
      codeLine: 6,
    },
    {
      description:
        "Lấy F ra và thăm. Queue rỗng → thuật toán kết thúc.\nThứ tự BFS: A B D C E F.",
      graph: tg(
        { A: "found", B: "found", C: "found", D: "found", E: "found", F: "found" },
        { A: "lớp 0", B: "lớp 1", D: "lớp 1", C: "lớp 2", E: "lớp 2", F: "lớp 3" },
        { "A-B": "found", "A-D": "found", "B-C": "found", "B-E": "found", "C-F": "found" },
      ),
      queue: [],
      queueLabel: "Queue",
      output: "A B D C E F",
      outputLabel: "Thứ tự BFS",
      codeLine: 2,
    },
    {
      description:
        "Hoàn thành! Mỗi đỉnh vào queue đúng một lần, mỗi cạnh được xét hai lần (một lần từ mỗi phía) → thời gian O(V + E), bộ nhớ O(V).\nỨng dụng quan trọng: trên đồ thị KHÔNG trọng số, BFS cho ra ngay đường đi ngắn nhất (tính theo số cạnh), vì nó luôn thăm lớp gần trước.\nLỗi hay gặp: đánh dấu visited lúc LẤY RA khỏi queue thay vì lúc ĐẨY VÀO — sẽ khiến một đỉnh bị đẩy vào queue nhiều lần.",
      graph: tg(
        { A: "found", B: "found", C: "found", D: "found", E: "found", F: "found" },
        { A: "lớp 0", B: "lớp 1", D: "lớp 1", C: "lớp 2", E: "lớp 2", F: "lớp 3" },
        { "A-B": "found", "A-D": "found", "B-C": "found", "B-E": "found", "C-F": "found" },
      ),
      output: "A B D C E F",
      outputLabel: "Thứ tự BFS",
      codeLine: 11,
    },
  ],
};

/** GRAPH02 - Duyệt đồ thị theo chiều sâu (DFS) */
export const graphDfs: VisualizerData = {
  title: "Duyệt đồ thị theo chiều sâu (DFS)",
  codeSnippet: [
    "function dfs(u) {",
    "  visited.add(u);",
    "  order.push(u);",
    "  for (const v of adj[u]) {",
    "    if (!visited.has(v)) dfs(v);",
    "  }",
    "}",
    "// hoặc dùng stack tường minh thay cho đệ quy",
  ],
  steps: [
    {
      description:
        "DFS làm ngược lại BFS: cứ lao thật SÂU theo một nhánh cho tới khi bí, rồi mới quay lui (backtrack).\nCấu trúc tương ứng là STACK (vào sau ra trước) — khi viết đệ quy thì chính ngăn xếp hàm đóng vai trò này.\nBắt đầu tại A.",
      graph: tg({ A: "active" }),
      stack: [cell("A", "active")],
      stackLabel: "Ngăn xếp đệ quy",
      output: "A",
      outputLabel: "Thứ tự DFS",
      codeLine: 1,
    },
    {
      description:
        "Từ A, lấy đỉnh kề đầu tiên là B và đi sâu xuống ngay (KHÔNG xét D lúc này — đó là điểm khác biệt lớn nhất so với BFS).\nStack: A → B",
      graph: tg(
        { A: "visited", B: "active" },
        {},
        { "A-B": "found" },
      ),
      stack: [cell("A", "visited"), cell("B", "active")],
      stackLabel: "Ngăn xếp đệ quy",
      output: "A B",
      outputLabel: "Thứ tự DFS",
      codeLine: 4,
    },
    {
      description:
        "Từ B: A đã thăm, đỉnh kề tiếp theo là C → đi sâu tiếp xuống C.\nStack: A → B → C",
      graph: tg(
        { A: "visited", B: "visited", C: "active" },
        {},
        { "A-B": "found", "B-C": "found" },
      ),
      stack: [cell("A", "visited"), cell("B", "visited"), cell("C", "active")],
      stackLabel: "Ngăn xếp đệ quy",
      output: "A B C",
      outputLabel: "Thứ tự DFS",
      codeLine: 4,
    },
    {
      description:
        "Từ C: B đã thăm, còn F chưa → đi xuống F.\nStack: A → B → C → F",
      graph: tg(
        { A: "visited", B: "visited", C: "visited", F: "active" },
        {},
        { "A-B": "found", "B-C": "found", "C-F": "found" },
      ),
      stack: [
        cell("A", "visited"),
        cell("B", "visited"),
        cell("C", "visited"),
        cell("F", "active"),
      ],
      stackLabel: "Ngăn xếp đệ quy",
      output: "A B C F",
      outputLabel: "Thứ tự DFS",
      codeLine: 4,
    },
    {
      description:
        "Từ F: C đã thăm, còn E chưa → đi xuống E.\nStack: A → B → C → F → E",
      graph: tg(
        { A: "visited", B: "visited", C: "visited", F: "visited", E: "active" },
        {},
        { "A-B": "found", "B-C": "found", "C-F": "found", "E-F": "found" },
      ),
      stack: [
        cell("A", "visited"),
        cell("B", "visited"),
        cell("C", "visited"),
        cell("F", "visited"),
        cell("E", "active"),
      ],
      stackLabel: "Ngăn xếp đệ quy",
      output: "A B C F E",
      outputLabel: "Thứ tự DFS",
      codeLine: 4,
    },
    {
      description:
        "Từ E: B và F đã thăm, còn D chưa → đi xuống D. Ngăn xếp đang sâu nhất ở đây (5 tầng) — chính là lý do DFS tốn O(h) bộ nhớ và có thể tràn ngăn xếp với đồ thị rất lớn.\nStack: A → B → C → F → E → D",
      graph: tg(
        { A: "visited", B: "visited", C: "visited", F: "visited", E: "visited", D: "active" },
        {},
        { "A-B": "found", "B-C": "found", "C-F": "found", "E-F": "found", "D-E": "found" },
      ),
      stack: [
        cell("A", "visited"),
        cell("B", "visited"),
        cell("C", "visited"),
        cell("F", "visited"),
        cell("E", "visited"),
        cell("D", "active"),
      ],
      stackLabel: "Ngăn xếp đệ quy",
      output: "A B C F E D",
      outputLabel: "Thứ tự DFS",
      codeLine: 4,
    },
    {
      description:
        "Từ D: cả A và E đều đã thăm → hết đường, QUAY LUI. Các lời gọi hàm lần lượt trả về và ngăn xếp xẹp dần: D → E → F → C → B → A.\nMọi đỉnh đều đã thăm nên DFS kết thúc.",
      graph: tg(
        { A: "found", B: "found", C: "found", D: "found", E: "found", F: "found" },
        {},
        { "A-B": "found", "B-C": "found", "C-F": "found", "E-F": "found", "D-E": "found" },
      ),
      stack: [],
      stackLabel: "Ngăn xếp đệ quy",
      output: "A B C F E D",
      outputLabel: "Thứ tự DFS",
      codeLine: 5,
    },
    {
      description:
        "Hoàn thành! Thứ tự DFS: A B C F E D — so với BFS (A B D C E F) thì hoàn toàn khác.\nĐộ phức tạp cũng là O(V + E), bộ nhớ O(V) cho ngăn xếp.\nDùng DFS khi cần: phát hiện chu trình, sắp xếp topo, tìm thành phần liên thông. Dùng BFS khi cần đường đi ngắn nhất theo số cạnh.",
      graph: tg(
        { A: "found", B: "found", C: "found", D: "found", E: "found", F: "found" },
        { A: "1", B: "2", C: "3", F: "4", E: "5", D: "6" },
        { "A-B": "found", "B-C": "found", "C-F": "found", "E-F": "found", "D-E": "found" },
      ),
      output: "A B C F E D",
      outputLabel: "Thứ tự DFS",
      codeLine: 6,
    },
  ],
};

/* -------------------------- Đồ thị cho Dijkstra ------------------------- */

const DIJ_POS: Pos[] = [
  { id: "A", x: 10, y: 28 },
  { id: "B", x: 48, y: 10 },
  { id: "C", x: 44, y: 72 },
  { id: "D", x: 86, y: 32 },
  { id: "E", x: 88, y: 76 },
];

const DIJ_LINKS: Link[] = [
  { from: "A", to: "B", weight: 4 },
  { from: "A", to: "C", weight: 2 },
  { from: "C", to: "B", weight: 1 },
  { from: "B", to: "D", weight: 5 },
  { from: "C", to: "D", weight: 8 },
  { from: "C", to: "E", weight: 10 },
  { from: "D", to: "E", weight: 2 },
];

const dg = (
  states: Record<string, NodeState>,
  badges: Record<string, string> = {},
  edges: Record<string, NodeState> = {},
) => makeGraph(DIJ_POS, DIJ_LINKS, states, badges, edges);

/** GRAPH03 - Đường đi ngắn nhất nguồn đơn (Dijkstra) */
export const graphDijkstra: VisualizerData = {
  title: "Đường đi ngắn nhất (Dijkstra)",
  codeSnippet: [
    "dist[start] = 0; // các đỉnh khác = ∞",
    "while (còn đỉnh chưa chốt) {",
    "  const u = đỉnh chưa chốt có dist nhỏ nhất;",
    "  chốt(u);",
    "  for (const [v, w] of adj[u]) {",
    "    if (dist[u] + w < dist[v])",
    "      dist[v] = dist[u] + w;   // nới lỏng",
    "  }",
    "}",
  ],
  steps: [
    {
      description:
        "Đồ thị có TRỌNG SỐ nên BFS không còn đúng — đi ít cạnh chưa chắc là đi ngắn.\nDijkstra hoạt động theo nguyên tắc tham lam: mỗi lượt chốt đỉnh có khoảng cách tạm thời NHỎ NHẤT, vì không còn đường nào có thể tới nó ngắn hơn nữa.\nKhởi tạo dist[A] = 0, các đỉnh khác = ∞.",
      graph: dg({ A: "active" }, { A: "0" }),
      map: [
        { key: "A", value: 0, state: "active" },
        { key: "B", value: "∞" },
        { key: "C", value: "∞" },
        { key: "D", value: "∞" },
        { key: "E", value: "∞" },
      ],
      mapLabel: "Bảng dist[] — khoảng cách ngắn nhất tạm thời",
      codeLine: 0,
    },
    {
      description:
        "Chốt A (dist = 0, nhỏ nhất). Nới lỏng các cạnh đi ra từ A:\n- dist[B] = 0 + 4 = 4\n- dist[C] = 0 + 2 = 2",
      graph: dg(
        { A: "found", B: "active", C: "active" },
        { A: "0", B: "4", C: "2" },
        { "A-B": "active", "A-C": "active" },
      ),
      map: [
        { key: "A", value: 0, state: "found" },
        { key: "B", value: 4, state: "active" },
        { key: "C", value: 2, state: "active" },
        { key: "D", value: "∞" },
        { key: "E", value: "∞" },
      ],
      mapLabel: "Bảng dist[] — khoảng cách ngắn nhất tạm thời",
      codeLine: 6,
    },
    {
      description:
        "Đỉnh chưa chốt có dist nhỏ nhất là C (2) → chốt C. Nới lỏng từ C:\n- Qua cạnh C-B (1): 2 + 1 = 3 < 4 → CẬP NHẬT dist[B] = 3. Đường A→C→B (2 cạnh) ngắn hơn A→B (1 cạnh)!\n- dist[D] = 2 + 8 = 10\n- dist[E] = 2 + 10 = 12",
      graph: dg(
        { A: "found", C: "found", B: "active", D: "active", E: "active" },
        { A: "0", C: "2", B: "3", D: "10", E: "12" },
        { "A-C": "found", "C-B": "active", "C-D": "active", "C-E": "active" },
      ),
      map: [
        { key: "A", value: 0, state: "found" },
        { key: "B", value: 3, state: "active" },
        { key: "C", value: 2, state: "found" },
        { key: "D", value: 10, state: "active" },
        { key: "E", value: 12, state: "active" },
      ],
      mapLabel: "Bảng dist[] — khoảng cách ngắn nhất tạm thời",
      variables: { "dist[B]": "4 → 3" },
      codeLine: 6,
    },
    {
      description:
        "Nhỏ nhất trong số chưa chốt là B (3) → chốt B. Nới lỏng cạnh B-D (5):\n- 3 + 5 = 8 < 10 → CẬP NHẬT dist[D] = 8.",
      graph: dg(
        { A: "found", C: "found", B: "found", D: "active", E: "visited" },
        { A: "0", C: "2", B: "3", D: "8", E: "12" },
        { "A-C": "found", "C-B": "found", "B-D": "active" },
      ),
      map: [
        { key: "A", value: 0, state: "found" },
        { key: "B", value: 3, state: "found" },
        { key: "C", value: 2, state: "found" },
        { key: "D", value: 8, state: "active" },
        { key: "E", value: 12 },
      ],
      mapLabel: "Bảng dist[] — khoảng cách ngắn nhất tạm thời",
      variables: { "dist[D]": "10 → 8" },
      codeLine: 6,
    },
    {
      description:
        "Chốt D (8). Nới lỏng cạnh D-E (2):\n- 8 + 2 = 10 < 12 → CẬP NHẬT dist[E] = 10.",
      graph: dg(
        { A: "found", C: "found", B: "found", D: "found", E: "active" },
        { A: "0", C: "2", B: "3", D: "8", E: "10" },
        { "A-C": "found", "C-B": "found", "B-D": "found", "D-E": "active" },
      ),
      map: [
        { key: "A", value: 0, state: "found" },
        { key: "B", value: 3, state: "found" },
        { key: "C", value: 2, state: "found" },
        { key: "D", value: 8, state: "found" },
        { key: "E", value: 10, state: "active" },
      ],
      mapLabel: "Bảng dist[] — khoảng cách ngắn nhất tạm thời",
      variables: { "dist[E]": "12 → 10" },
      codeLine: 6,
    },
    {
      description:
        "Chốt E (10) — đỉnh cuối cùng. Không còn đỉnh nào chưa chốt nên thuật toán kết thúc.\nĐường đi ngắn nhất từ A đến E: A → C → B → D → E với tổng 2 + 1 + 5 + 2 = 10.",
      graph: dg(
        { A: "found", B: "found", C: "found", D: "found", E: "found" },
        { A: "0", C: "2", B: "3", D: "8", E: "10" },
        { "A-C": "found", "C-B": "found", "B-D": "found", "D-E": "found" },
      ),
      map: [
        { key: "A", value: 0, state: "found" },
        { key: "B", value: 3, state: "found" },
        { key: "C", value: 2, state: "found" },
        { key: "D", value: 8, state: "found" },
        { key: "E", value: 10, state: "found" },
      ],
      mapLabel: "Bảng dist[] — khoảng cách ngắn nhất tạm thời",
      output: "A → C → B → D → E = 10",
      outputLabel: "Đường ngắn nhất",
      codeLine: 8,
    },
    {
      description:
        "Hoàn thành! Dùng hàng đợi ưu tiên (min-heap) để chọn đỉnh nhỏ nhất thì độ phức tạp là O((V + E) log V); nếu quét tuyến tính thì O(V²).\nGIỚI HẠN quan trọng: Dijkstra chỉ đúng với trọng số KHÔNG ÂM. Nguyên tắc 'đã chốt là không đổi nữa' sẽ sai nếu tồn tại cạnh âm — lúc đó phải dùng Bellman-Ford.",
      graph: dg(
        { A: "found", B: "found", C: "found", D: "found", E: "found" },
        { A: "0", C: "2", B: "3", D: "8", E: "10" },
        { "A-C": "found", "C-B": "found", "B-D": "found", "D-E": "found" },
      ),
      output: "A → C → B → D → E = 10",
      outputLabel: "Đường ngắn nhất",
      codeLine: 8,
    },
  ],
};
