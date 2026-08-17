import { ln, type VisualizerData } from "../types";

/** NODE01 - Khởi tạo và liên kết các Node đơn lẻ */
export const nodeCreateLink: VisualizerData = {
  title: "Khởi tạo và liên kết các Node đơn lẻ",
  codeSnippet: [
    "class Node {",
    "  constructor(data) {",
    "    this.data = data;",
    "    this.next = null;",
    "  }",
    "}",
    "const a = new Node(10);",
    "const b = new Node(20);",
    "a.next = b;",
  ],
  steps: [
    {
      description:
        "Một Node gồm 2 phần: DATA (dữ liệu) và NEXT (địa chỉ node kế tiếp). Khi mới tạo, next luôn là NULL — node đang đứng một mình.\nTa sẽ tạo 3 node rời rồi tự tay nối chúng thành chuỗi.",
      list: { nodes: [], pending: ln(10, "active"), pendingLabel: "Node A vừa tạo" },
      variables: { "a.data": 10, "a.next": "NULL" },
      codeLine: 6,
    },
    {
      description:
        "Node A (data = 10) đã tồn tại độc lập, next = NULL. Coi A là head của chuỗi đang hình thành.",
      list: { nodes: [ln(10, "found", ["head", "a"])] },
      variables: { "a.data": 10, "a.next": "NULL" },
      codeLine: 6,
    },
    {
      description:
        "Tạo tiếp Node B (data = 20). Lúc này A và B là hai node RỜI NHAU, chưa có liên hệ gì.",
      list: {
        nodes: [ln(10, "idle", ["head", "a"])],
        pending: ln(20, "active"),
        pendingLabel: "Node B vừa tạo",
      },
      variables: { "b.data": 20, "b.next": "NULL" },
      codeLine: 7,
    },
    {
      description:
        "Gán a.next = b. Đây chính là hành động 'liên kết': A không chứa B, nó chỉ lưu ĐỊA CHỈ của B.\nChuỗi hiện tại: 10 → 20 → NULL.",
      list: {
        nodes: [ln(10, "found", ["head", "a"]), ln(20, "found", ["b"])],
      },
      variables: { "a.next": "b" },
      codeLine: 8,
    },
    {
      description: "Tạo Node C (data = 30), tiếp tục là một node rời.",
      list: {
        nodes: [ln(10, "idle", ["head"]), ln(20, "idle", ["b"])],
        pending: ln(30, "active"),
        pendingLabel: "Node C vừa tạo",
      },
      variables: { "c.data": 30, "c.next": "NULL" },
      codeLine: 7,
    },
    {
      description:
        "Gán b.next = c → hoàn tất chuỗi 3 node: 10 → 20 → 30 → NULL.\nChỉ cần giữ head là truy cập được toàn bộ chuỗi.",
      list: {
        nodes: [ln(10, "found", ["head"]), ln(20, "found"), ln(30, "found", ["c"])],
      },
      output: "10 20 30",
      outputLabel: "Chuỗi node",
      codeLine: 8,
    },
    {
      description:
        "Điểm khác biệt cốt lõi so với mảng: các node này KHÔNG nằm liền nhau trong bộ nhớ, chúng có thể ở bất cứ đâu và được nối với nhau bằng con trỏ next.\nĐổi lại, ta không thể nhảy tới phần tử thứ i ngay như mảng, mà phải đi lần lượt từ head.",
      list: {
        nodes: [ln(10, "found", ["head"]), ln(20, "found"), ln(30, "found")],
      },
      output: "10 20 30",
      outputLabel: "Chuỗi node",
      codeLine: 8,
    },
  ],
};

/** NODE02 - Duyệt chuỗi Node tìm phần tử cuối (Tail) */
export const nodeFindTail: VisualizerData = {
  title: "Duyệt chuỗi Node tìm phần tử cuối (Tail)",
  codeSnippet: [
    "let cur = head;",
    "while (cur.next !== null) {",
    "  cur = cur.next;",
    "}",
    "return cur.data; // tail",
  ],
  steps: [
    {
      description:
        "Chuỗi: 5 → 8 → 13 → 21 → NULL. Dấu hiệu nhận biết node cuối là next === NULL.\nKhởi tạo cur = head.\nLƯU Ý: điều kiện lặp là cur.next !== null (không phải cur !== null) — nếu dùng sai, cur sẽ vượt qua tail và thành NULL.",
      list: { nodes: [ln(5, "active", ["cur", "head"]), ln(8), ln(13), ln(21)] },
      variables: { "cur.data": 5, "cur.next": 8 },
      codeLine: 0,
    },
    {
      description: "cur.next = node 8 ≠ NULL → chưa phải cuối. Dịch cur sang node 8.",
      list: {
        nodes: [ln(5, "visited", ["head"]), ln(8, "active", ["cur"]), ln(13), ln(21)],
      },
      variables: { "cur.data": 8, "cur.next": 13 },
      codeLine: 2,
    },
    {
      description: "cur.next = node 13 ≠ NULL → dịch cur sang node 13.",
      list: {
        nodes: [ln(5, "visited", ["head"]), ln(8, "visited"), ln(13, "active", ["cur"]), ln(21)],
      },
      variables: { "cur.data": 13, "cur.next": 21 },
      codeLine: 2,
    },
    {
      description: "cur.next = node 21 ≠ NULL → dịch cur sang node 21.",
      list: {
        nodes: [
          ln(5, "visited", ["head"]),
          ln(8, "visited"),
          ln(13, "visited"),
          ln(21, "active", ["cur"]),
        ],
      },
      variables: { "cur.data": 21, "cur.next": "NULL" },
      codeLine: 2,
    },
    {
      description:
        "cur.next === NULL → vòng lặp dừng. cur đang đứng đúng ở node cuối cùng.\nTail = 21.",
      list: {
        nodes: [
          ln(5, "visited", ["head"]),
          ln(8, "visited"),
          ln(13, "visited"),
          ln(21, "found", ["cur", "tail"]),
        ],
      },
      output: "21",
      outputLabel: "Giá trị tail",
      codeLine: 4,
    },
    {
      description:
        "Hoàn thành! Phải đi qua toàn bộ n node nên độ phức tạp O(n).\nTrường hợp biên cần kiểm tra trước: nếu head === NULL (chuỗi rỗng) thì không có tail, truy cập head.next sẽ gây lỗi.",
      list: {
        nodes: [ln(5, "idle", ["head"]), ln(8), ln(13), ln(21, "found", ["tail"])],
      },
      output: "21",
      outputLabel: "Giá trị tail",
      codeLine: 4,
    },
  ],
};

/** NODE03 - Duyệt lọc phần tử chẵn/lẻ trên cấu trúc Node */
export const nodeFilterEven: VisualizerData = {
  title: "Lọc phần tử chẵn/lẻ trên chuỗi Node",
  codeSnippet: [
    "const out = [];",
    "let cur = head;",
    "while (cur !== null) {",
    "  if (cur.data % 2 === 0) out.push(cur.data);",
    "  cur = cur.next;",
    "}",
    "return out;",
  ],
  steps: [
    {
      description:
        "Chuỗi: 4 → 7 → 10 → 3 → 6 → NULL. Yêu cầu lấy ra các phần tử CHẴN theo đúng thứ tự gặp.\nChỉ cần một lượt duyệt, kiểm tra điều kiện cur.data % 2 === 0 tại mỗi node.",
      list: { nodes: [ln(4, "active", ["cur", "head"]), ln(7), ln(10), ln(3), ln(6)] },
      output: "",
      outputLabel: "Danh sách chẵn",
      codeLine: 1,
    },
    {
      description: "Node 4: 4 % 2 = 0 → CHẴN, nhận vào kết quả.",
      list: {
        nodes: [ln(4, "found", ["cur"]), ln(7), ln(10), ln(3), ln(6)],
      },
      variables: { "cur.data": 4, "chẵn": true },
      output: "4",
      outputLabel: "Danh sách chẵn",
      codeLine: 3,
    },
    {
      description: "Node 7: 7 % 2 = 1 → LẺ, bỏ qua và đi tiếp.",
      list: {
        nodes: [ln(4, "found"), ln(7, "muted", ["cur"]), ln(10), ln(3), ln(6)],
      },
      variables: { "cur.data": 7, "chẵn": false },
      output: "4",
      outputLabel: "Danh sách chẵn",
      codeLine: 3,
    },
    {
      description: "Node 10: chia hết cho 2 → CHẴN, nhận vào kết quả.",
      list: {
        nodes: [ln(4, "found"), ln(7, "muted"), ln(10, "found", ["cur"]), ln(3), ln(6)],
      },
      variables: { "cur.data": 10, "chẵn": true },
      output: "4 10",
      outputLabel: "Danh sách chẵn",
      codeLine: 3,
    },
    {
      description: "Node 3: LẺ → bỏ qua.",
      list: {
        nodes: [ln(4, "found"), ln(7, "muted"), ln(10, "found"), ln(3, "muted", ["cur"]), ln(6)],
      },
      variables: { "cur.data": 3, "chẵn": false },
      output: "4 10",
      outputLabel: "Danh sách chẵn",
      codeLine: 3,
    },
    {
      description: "Node 6: CHẴN → nhận. cur.next là NULL nên đây là node cuối.",
      list: {
        nodes: [
          ln(4, "found"),
          ln(7, "muted"),
          ln(10, "found"),
          ln(3, "muted"),
          ln(6, "found", ["cur"]),
        ],
      },
      variables: { "cur.data": 6, "chẵn": true },
      output: "4 10 6",
      outputLabel: "Danh sách chẵn",
      codeLine: 3,
    },
    {
      description:
        "Hoàn thành! Các phần tử chẵn: 4, 10, 6 (các node xám là số lẻ đã bị loại).\nMột lượt duyệt duy nhất: thời gian O(n), bộ nhớ O(k) với k là số phần tử thoả điều kiện.",
      list: {
        nodes: [
          ln(4, "found"),
          ln(7, "muted"),
          ln(10, "found"),
          ln(3, "muted"),
          ln(6, "found"),
        ],
      },
      output: "4 10 6",
      outputLabel: "Danh sách chẵn",
      codeLine: 6,
    },
  ],
};

/** NODE04 - Triển khai và duyệt Node đôi (Doubly Node) */
export const nodeDoubly: VisualizerData = {
  title: "Node đôi (Doubly Node) và duyệt hai chiều",
  codeSnippet: [
    "class DNode {",
    "  constructor(data) {",
    "    this.data = data;",
    "    this.prev = null;",
    "    this.next = null;",
    "  }",
    "}",
    "// duyệt xuôi:  cur = cur.next",
    "// duyệt ngược: cur = cur.prev",
  ],
  steps: [
    {
      description:
        "Node đôi có thêm con trỏ PREV trỏ về node đứng trước, ngoài NEXT trỏ tới node sau. Vì vậy mũi tên ở đây là hai chiều.\nChuỗi: NULL ↔ 10 ↔ 20 ↔ 30 ↔ NULL.",
      list: {
        nodes: [ln(10, "idle", ["head"]), ln(20), ln(30, "idle", ["tail"])],
        doubly: true,
      },
      codeLine: 0,
    },
    {
      description:
        "Duyệt XUÔI từ head, dùng cur = cur.next.\nBắt đầu tại node 10 (prev của nó là NULL — dấu hiệu đây là node đầu).",
      list: {
        nodes: [ln(10, "active", ["cur", "head"]), ln(20), ln(30, "idle", ["tail"])],
        doubly: true,
      },
      variables: { "cur.prev": "NULL", "cur.data": 10 },
      output: "10",
      outputLabel: "Duyệt xuôi",
      codeLine: 7,
    },
    {
      description: "cur = cur.next → node 20. Node này có cả prev (10) và next (30).",
      list: {
        nodes: [ln(10, "visited", ["head"]), ln(20, "active", ["cur"]), ln(30, "idle", ["tail"])],
        doubly: true,
      },
      variables: { "cur.prev": 10, "cur.data": 20, "cur.next": 30 },
      output: "10 20",
      outputLabel: "Duyệt xuôi",
      codeLine: 7,
    },
    {
      description:
        "cur = cur.next → node 30. next của nó là NULL nên đây là tail. Kết thúc lượt duyệt xuôi.",
      list: {
        nodes: [
          ln(10, "visited", ["head"]),
          ln(20, "visited"),
          ln(30, "found", ["cur", "tail"]),
        ],
        doubly: true,
      },
      variables: { "cur.data": 30, "cur.next": "NULL" },
      output: "10 20 30",
      outputLabel: "Duyệt xuôi",
      codeLine: 7,
    },
    {
      description:
        "Giờ đến điểm mạnh của node đôi: duyệt NGƯỢC ngay từ tail mà không cần đi lại từ đầu.\nĐặt cur = tail = node 30, dùng cur = cur.prev.",
      list: {
        nodes: [ln(10), ln(20), ln(30, "active", ["cur", "tail"])],
        doubly: true,
      },
      variables: { "cur.data": 30 },
      output: "30",
      outputLabel: "Duyệt ngược",
      codeLine: 8,
    },
    {
      description: "cur = cur.prev → node 20.",
      list: {
        nodes: [ln(10), ln(20, "active", ["cur"]), ln(30, "visited", ["tail"])],
        doubly: true,
      },
      variables: { "cur.data": 20 },
      output: "30 20",
      outputLabel: "Duyệt ngược",
      codeLine: 8,
    },
    {
      description:
        "cur = cur.prev → node 10. prev của node 10 là NULL nên dừng lại.",
      list: {
        nodes: [ln(10, "found", ["cur", "head"]), ln(20, "visited"), ln(30, "visited")],
        doubly: true,
      },
      variables: { "cur.data": 10, "cur.prev": "NULL" },
      output: "30 20 10",
      outputLabel: "Duyệt ngược",
      codeLine: 8,
    },
    {
      description:
        "Hoàn thành! Xuôi: 10 20 30 — Ngược: 30 20 10.\nĐánh đổi: mỗi node tốn thêm bộ nhớ cho một con trỏ, và mỗi lần chèn/xóa phải cập nhật CẢ prev và next (dễ sai hơn). Bù lại, nếu đã có con trỏ tới một node thì xóa nó chỉ mất O(1) vì ta biết ngay node đứng trước.",
      list: {
        nodes: [ln(10, "found", ["head"]), ln(20, "found"), ln(30, "found", ["tail"])],
        doubly: true,
      },
      codeLine: 8,
    },
  ],
};

/** NODE05 - Phát hiện chu trình vòng lặp (Floyd) */
export const nodeDetectCycle: VisualizerData = {
  title: "Phát hiện chu trình (thuật toán rùa và thỏ)",
  codeSnippet: [
    "let slow = head, fast = head;",
    "while (fast !== null && fast.next !== null) {",
    "  slow = slow.next;        // 1 bước",
    "  fast = fast.next.next;   // 2 bước",
    "  if (slow === fast) return true;",
    "}",
    "return false;",
  ],
  steps: [
    {
      description:
        "Chuỗi này bị lỗi: node cuối (5) không trỏ NULL mà quay về node[2] tạo thành vòng lặp vô tận.\nThuật toán Floyd (rùa và thỏ): slow đi 1 bước, fast đi 2 bước mỗi lần lặp. Nếu có chu trình, fast chắc chắn sẽ đuổi kịp slow bên trong vòng.",
      list: {
        nodes: [ln(1, "active", ["slow", "fast"]), ln(2), ln(3), ln(4), ln(5)],
        cycleTo: 2,
      },
      variables: { slow: 1, fast: 1 },
      codeLine: 0,
    },
    {
      description:
        "Lần lặp 1: slow đi 1 bước tới node 2. fast đi 2 bước tới node 3.\nKhoảng cách giữa hai con trỏ đang nới ra.",
      list: {
        nodes: [ln(1, "visited"), ln(2, "active", ["slow"]), ln(3, "active", ["fast"]), ln(4), ln(5)],
        cycleTo: 2,
      },
      variables: { slow: 2, fast: 3 },
      codeLine: 3,
    },
    {
      description:
        "Lần lặp 2: slow tới node 3, fast đi 2 bước (4 → 5) tới node 5 — node cuối cùng.\nNếu chuỗi bình thường, fast sẽ chạm NULL ở bước sau và ta kết luận KHÔNG có chu trình.",
      list: {
        nodes: [ln(1, "visited"), ln(2, "visited"), ln(3, "active", ["slow"]), ln(4), ln(5, "active", ["fast"])],
        cycleTo: 2,
      },
      variables: { slow: 3, fast: 5 },
      codeLine: 3,
    },
    {
      description:
        "Lần lặp 3: slow tới node 4. fast đi 2 bước nhưng vì node 5 quay về node 3, đường đi của nó là 5 → 3 → 4.\nHai con trỏ GẶP NHAU tại node 4!",
      list: {
        nodes: [ln(1, "visited"), ln(2, "visited"), ln(3, "visited"), ln(4, "danger", ["slow", "fast"]), ln(5, "visited")],
        cycleTo: 2,
      },
      variables: { slow: 4, fast: 4, "slow === fast": true },
      codeLine: 4,
    },
    {
      description:
        "slow === fast → trả về true: chuỗi CÓ chu trình.\nLý do thuật toán luôn đúng: khi cả hai đã vào trong vòng, mỗi lần lặp fast tiến gần slow thêm đúng 1 bước, nên khoảng cách chắc chắn giảm về 0 chứ không thể nhảy qua nhau.",
      list: {
        nodes: [ln(1, "muted"), ln(2, "muted"), ln(3, "found"), ln(4, "found", ["slow", "fast"]), ln(5, "found")],
        cycleTo: 2,
      },
      output: "true",
      outputLabel: "Có chu trình?",
      codeLine: 4,
    },
    {
      description:
        "Hoàn thành! Thời gian O(n), bộ nhớ O(1) — hơn hẳn cách dùng Set để lưu các node đã thăm (tốn O(n) bộ nhớ).\nNếu chuỗi không có chu trình, fast sẽ chạm NULL và vòng lặp thoát ra, trả về false.",
      list: {
        nodes: [ln(1, "muted"), ln(2, "muted"), ln(3, "found"), ln(4, "found"), ln(5, "found")],
        cycleTo: 2,
      },
      output: "true",
      outputLabel: "Có chu trình?",
      codeLine: 6,
    },
  ],
};
