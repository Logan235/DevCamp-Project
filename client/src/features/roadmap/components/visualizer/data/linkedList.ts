import { ln, type VisualizerData } from "../types";

/** LL01 - Chèn phần tử vào đầu danh sách (Insert Head) */
export const llInsertHead: VisualizerData = {
  title: "Chèn vào đầu danh sách liên kết (Insert Head)",
  codeSnippet: [
    "function insertHead(head, value) {",
    "  const node = new Node(value);",
    "  node.next = head;",
    "  head = node;",
    "  return head;",
    "}",
  ],
  steps: [
    {
      description:
        "Danh sách hiện tại: 10 → 20 → 30 → NULL. Con trỏ head đang giữ node đầu tiên (10).\nMục tiêu: chèn giá trị 5 vào đầu danh sách với chi phí O(1).",
      list: { nodes: [ln(10, "idle", ["head"]), ln(20), ln(30)] },
      variables: { value: 5 },
      codeLine: 0,
    },
    {
      description:
        "Bước 1: cấp phát một node mới mang giá trị 5. Node này chưa nối vào đâu, trường next của nó đang là NULL.",
      list: {
        nodes: [ln(10, "idle", ["head"]), ln(20), ln(30)],
        pending: ln(5, "active"),
      },
      variables: { value: 5 },
      codeLine: 1,
    },
    {
      description:
        "Bước 2: trỏ node.next về head cũ. Đây là bước quan trọng nhất — phải nối trước rồi mới đổi head, nếu làm ngược lại ta sẽ mất địa chỉ của cả danh sách cũ.",
      list: {
        nodes: [ln(5, "active", ["node"]), ln(10, "idle", ["head"]), ln(20), ln(30)],
      },
      variables: { value: 5 },
      codeLine: 2,
    },
    {
      description:
        "Bước 3: cập nhật head = node. Node 5 chính thức trở thành phần tử đầu tiên của danh sách.",
      list: {
        nodes: [ln(5, "found", ["head"]), ln(10), ln(20), ln(30)],
      },
      codeLine: 3,
    },
    {
      description:
        "Hoàn thành! Danh sách mới: 5 → 10 → 20 → 30 → NULL.\nKhác với mảng (phải dịch toàn bộ phần tử, O(n)), chèn đầu vào danh sách liên kết chỉ mất O(1).",
      list: {
        nodes: [ln(5, "found", ["head"]), ln(10), ln(20), ln(30)],
      },
      output: "5 10 20 30",
      outputLabel: "Danh sách sau khi chèn",
      codeLine: 4,
    },
  ],
};

/** LL02 - Chèn phần tử vào cuối danh sách (Insert Tail) */
export const llInsertTail: VisualizerData = {
  title: "Chèn vào cuối danh sách liên kết (Insert Tail)",
  codeSnippet: [
    "function insertTail(head, value) {",
    "  const node = new Node(value);",
    "  if (!head) return node;",
    "  let cur = head;",
    "  while (cur.next !== null) cur = cur.next;",
    "  cur.next = node;",
    "  return head;",
    "}",
  ],
  steps: [
    {
      description:
        "Danh sách: 10 → 20 → 30 → NULL. Muốn chèn 40 vào cuối, ta phải tìm được node cuối cùng trước — vì danh sách liên kết đơn không có đường đi ngược.\nKhởi tạo con trỏ cur = head.",
      list: { nodes: [ln(10, "active", ["cur", "head"]), ln(20), ln(30)] },
      variables: { value: 40 },
      codeLine: 3,
    },
    {
      description:
        "cur.next của node 10 không phải NULL nên chưa tới cuối. Dịch cur = cur.next → cur đang ở node 20.",
      list: {
        nodes: [ln(10, "visited", ["head"]), ln(20, "active", ["cur"]), ln(30)],
      },
      variables: { value: 40 },
      codeLine: 4,
    },
    {
      description: "cur.next của node 20 vẫn khác NULL. Tiếp tục dịch cur sang node 30.",
      list: {
        nodes: [ln(10, "visited", ["head"]), ln(20, "visited"), ln(30, "active", ["cur"])],
      },
      variables: { value: 40 },
      codeLine: 4,
    },
    {
      description:
        "cur.next của node 30 là NULL → đã tìm ra node cuối (tail). Vòng lặp dừng lại tại đây.",
      list: {
        nodes: [
          ln(10, "visited", ["head"]),
          ln(20, "visited"),
          ln(30, "active", ["cur", "tail"]),
        ],
      },
      variables: { value: 40 },
      codeLine: 4,
    },
    {
      description: "Cấp phát node mới mang giá trị 40, next của nó là NULL.",
      list: {
        nodes: [
          ln(10, "visited", ["head"]),
          ln(20, "visited"),
          ln(30, "active", ["tail"]),
        ],
        pending: ln(40, "active"),
      },
      variables: { value: 40 },
      codeLine: 1,
    },
    {
      description:
        "Nối cur.next = node. Node 40 trở thành phần tử cuối cùng của danh sách.",
      list: {
        nodes: [ln(10, "idle", ["head"]), ln(20), ln(30), ln(40, "found", ["tail"])],
      },
      codeLine: 5,
    },
    {
      description:
        "Hoàn thành! Danh sách: 10 → 20 → 30 → 40 → NULL.\nVì phải duyệt tới cuối nên chèn cuối tốn O(n). Nếu lưu thêm con trỏ tail thì chi phí giảm về O(1).",
      list: {
        nodes: [ln(10, "idle", ["head"]), ln(20), ln(30), ln(40, "found", ["tail"])],
      },
      output: "10 20 30 40",
      outputLabel: "Danh sách sau khi chèn",
      codeLine: 6,
    },
  ],
};

/** LL03 - Xóa node tại vị trí bất kỳ K */
export const llDeleteAtK: VisualizerData = {
  title: "Xóa node tại vị trí K",
  codeSnippet: [
    "let prev = null, cur = head, pos = 1;",
    "while (cur !== null && pos < k) {",
    "  prev = cur; cur = cur.next; pos++;",
    "}",
    "if (prev === null) head = cur.next;",
    "else prev.next = cur.next;",
  ],
  steps: [
    {
      description:
        "Danh sách: 10 → 20 → 30 → 40 → 50 → NULL. Yêu cầu xóa node ở vị trí k = 3 (đếm từ 1), tức là node giá trị 30.\nMẹo: luôn giữ thêm con trỏ prev đi phía sau cur, vì để nối lại chuỗi ta cần node ĐỨNG TRƯỚC node bị xóa.",
      list: {
        nodes: [ln(10, "active", ["cur", "head"]), ln(20), ln(30), ln(40), ln(50)],
      },
      variables: { k: 3, pos: 1, prev: "NULL" },
      codeLine: 0,
    },
    {
      description:
        "pos = 1 < k nên đi tiếp: prev = node 10, cur = node 20, pos = 2.",
      list: {
        nodes: [
          ln(10, "visited", ["prev"]),
          ln(20, "active", ["cur"]),
          ln(30),
          ln(40),
          ln(50),
        ],
      },
      variables: { k: 3, pos: 2, prev: 10 },
      codeLine: 2,
    },
    {
      description:
        "pos = 2 < k nên đi tiếp: prev = node 20, cur = node 30, pos = 3.\nĐã tới đúng vị trí cần xóa — vòng lặp dừng.",
      list: {
        nodes: [
          ln(10, "visited"),
          ln(20, "visited", ["prev"]),
          ln(30, "active", ["cur"]),
          ln(40),
          ln(50),
        ],
      },
      variables: { k: 3, pos: 3, prev: 20 },
      codeLine: 1,
    },
    {
      description:
        "Thực hiện phép nối tắt: prev.next = cur.next, tức node 20 trỏ thẳng sang node 40, bỏ qua node 30.\nNode 30 lúc này không còn ai trỏ tới nên đã bị tách khỏi chuỗi.",
      list: {
        nodes: [
          ln(10, "idle", ["head"]),
          ln(20, "active", ["prev"]),
          ln(40, "active"),
          ln(50),
        ],
        pending: ln(30, "danger"),
        pendingLabel: "Node đã bị tách khỏi chuỗi",
      },
      variables: { k: 3 },
      codeLine: 5,
    },
    {
      description:
        "Giải phóng bộ nhớ của node 30 (trong C/C++ là free/delete, trong JS thì bộ thu gom rác tự lo).\nDanh sách còn lại: 10 → 20 → 40 → 50 → NULL.",
      list: {
        nodes: [ln(10, "found", ["head"]), ln(20, "found"), ln(40, "found"), ln(50, "found")],
      },
      output: "10 20 40 50",
      outputLabel: "Danh sách sau khi xóa",
      codeLine: 5,
    },
    {
      description:
        "Lưu ý trường hợp biên: nếu k = 1 thì prev vẫn là NULL, khi đó phải cập nhật head = cur.next thay vì prev.next. Đây là lỗi hay gặp nhất ở bài này.\nĐộ phức tạp: O(k) để duyệt, O(1) để nối lại.",
      list: {
        nodes: [ln(10, "found", ["head"]), ln(20), ln(40), ln(50)],
      },
      codeLine: 4,
    },
  ],
};

/** LL04 - Tìm vị trí xuất hiện của phần tử X */
export const llSearch: VisualizerData = {
  title: "Tìm vị trí xuất hiện của phần tử X",
  codeSnippet: [
    "let cur = head, pos = 1;",
    "while (cur !== null) {",
    "  if (cur.value === x) return pos;",
    "  cur = cur.next; pos++;",
    "}",
    "return -1;",
  ],
  steps: [
    {
      description:
        "Danh sách: 4 → 9 → 2 → 7 → NULL, cần tìm X = 2.\nKhác với mảng, danh sách liên kết không truy cập trực tiếp theo chỉ số được — bắt buộc phải duyệt tuần tự từ head.",
      list: { nodes: [ln(4, "active", ["cur", "head"]), ln(9), ln(2), ln(7)] },
      variables: { x: 2, pos: 1 },
      codeLine: 0,
    },
    {
      description: "pos = 1: cur.value = 4, khác 2. Đi tiếp cur = cur.next.",
      list: {
        nodes: [ln(4, "muted"), ln(9, "active", ["cur"]), ln(2), ln(7)],
      },
      variables: { x: 2, pos: 2 },
      codeLine: 3,
    },
    {
      description: "pos = 2: cur.value = 9, vẫn khác 2. Tiếp tục đi tiếp.",
      list: {
        nodes: [ln(4, "muted"), ln(9, "muted"), ln(2, "active", ["cur"]), ln(7)],
      },
      variables: { x: 2, pos: 3 },
      codeLine: 3,
    },
    {
      description:
        "pos = 3: cur.value = 2 — trùng với X! Trả về ngay vị trí 3 mà không cần duyệt phần còn lại.",
      list: {
        nodes: [ln(4, "muted"), ln(9, "muted"), ln(2, "found", ["cur"]), ln(7)],
      },
      variables: { x: 2, pos: 3, "kết quả": 3 },
      output: "3",
      outputLabel: "Vị trí tìm được",
      codeLine: 2,
    },
    {
      description:
        "Nếu duyệt tới NULL mà không thấy thì trả về -1.\nĐộ phức tạp: tốt nhất O(1) (ngay node đầu), xấu nhất O(n).",
      list: {
        nodes: [ln(4, "muted"), ln(9, "muted"), ln(2, "found"), ln(7, "muted")],
      },
      output: "3",
      outputLabel: "Vị trí tìm được",
      codeLine: 5,
    },
  ],
};

/** LL05 - Đảo ngược danh sách liên kết đơn */
export const llReverse: VisualizerData = {
  title: "Đảo ngược danh sách liên kết đơn",
  codeSnippet: [
    "let prev = null, cur = head;",
    "while (cur !== null) {",
    "  const next = cur.next;",
    "  cur.next = prev;",
    "  prev = cur;",
    "  cur = next;",
    "}",
    "return prev;",
  ],
  steps: [
    {
      description:
        "Danh sách: 1 → 2 → 3 → 4 → NULL. Ta sẽ lật từng liên kết một, dùng 3 con trỏ prev / cur / next.\nKhởi tạo prev = NULL, cur = head (node 1). Ở hình dưới, mũi tên tím hướng sang trái là những liên kết đã bị lật.",
      list: {
        nodes: [ln(1, "active", ["cur"]), ln(2), ln(3), ln(4)],
        reversedCount: 0,
      },
      variables: { prev: "NULL", cur: 1 },
      codeLine: 0,
    },
    {
      description:
        "Lần lặp 1: lưu next = node 2 (bắt buộc lưu trước, không thì lật xong sẽ mất đường đi).\nLật liên kết: node 1 trỏ về prev = NULL. Sau đó prev = node 1, cur = node 2.\nChuỗi bị tách thành 2 đoạn: đoạn đã đảo (NULL ← 1) và đoạn còn lại (2 → 3 → 4).",
      list: {
        nodes: [ln(1, "visited", ["prev"]), ln(2, "active", ["cur"]), ln(3), ln(4)],
        reversedCount: 1,
      },
      variables: { prev: 1, cur: 2, next: 2 },
      codeLine: 3,
    },
    {
      description:
        "Lần lặp 2: next = node 3, lật node 2 trỏ về node 1. prev = node 2, cur = node 3.\nĐoạn đã đảo: NULL ← 1 ← 2.",
      list: {
        nodes: [ln(1, "visited"), ln(2, "visited", ["prev"]), ln(3, "active", ["cur"]), ln(4)],
        reversedCount: 2,
      },
      variables: { prev: 2, cur: 3, next: 3 },
      codeLine: 3,
    },
    {
      description:
        "Lần lặp 3: next = node 4, lật node 3 trỏ về node 2. prev = node 3, cur = node 4.\nĐoạn đã đảo: NULL ← 1 ← 2 ← 3.",
      list: {
        nodes: [
          ln(1, "visited"),
          ln(2, "visited"),
          ln(3, "visited", ["prev"]),
          ln(4, "active", ["cur"]),
        ],
        reversedCount: 3,
      },
      variables: { prev: 3, cur: 4, next: 4 },
      codeLine: 3,
    },
    {
      description:
        "Lần lặp 4: next = NULL, lật node 4 trỏ về node 3. prev = node 4, cur = NULL.\ncur đã là NULL nên vòng lặp kết thúc. Toàn bộ liên kết đã được lật.",
      list: {
        nodes: [ln(1, "visited"), ln(2, "visited"), ln(3, "visited"), ln(4, "found", ["prev"])],
        reversedCount: 4,
      },
      variables: { prev: 4, cur: "NULL" },
      codeLine: 1,
    },
    {
      description:
        "Trả về prev làm head mới. Vẽ lại theo chiều xuôi ta được: 4 → 3 → 2 → 1 → NULL.\nMỗi node được xử lý đúng một lần: thời gian O(n), bộ nhớ O(1) — không cần mảng phụ hay đệ quy.",
      list: {
        nodes: [ln(4, "found", ["head"]), ln(3, "found"), ln(2, "found"), ln(1, "found")],
        reversedCount: 0,
      },
      output: "4 3 2 1",
      outputLabel: "Danh sách sau khi đảo",
      codeLine: 7,
    },
  ],
};
