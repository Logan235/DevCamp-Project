import type { NodeState, TreeNodeView, VisualizerData } from "../types";

type Spec = { v: number | string; l?: Spec; r?: Spec };

/** Dựng cây từ mô tả tĩnh, gắn trạng thái/badge theo giá trị node. */
function build(
  spec: Spec,
  states: Record<string, NodeState> = {},
  badges: Record<string, string> = {},
): TreeNodeView {
  return {
    value: spec.v,
    state: states[String(spec.v)],
    badge: badges[String(spec.v)],
    left: spec.l ? build(spec.l, states, badges) : null,
    right: spec.r ? build(spec.r, states, badges) : null,
  };
}

/** BST dùng cho TREE01, TREE02 và TREE04. */
const BST: Spec = {
  v: 8,
  l: { v: 3, l: { v: 1 }, r: { v: 6 } },
  r: { v: 10, r: { v: 14 } },
};

/** TREE01 - Duyệt cây nhị phân tìm kiếm theo thứ tự giữa (Inorder) */
export const treeInorder: VisualizerData = {
  title: "Duyệt cây theo thứ tự giữa (Inorder)",
  codeSnippet: [
    "function inorder(node, out) {",
    "  if (node === null) return;",
    "  inorder(node.left, out);",
    "  out.push(node.value);",
    "  inorder(node.right, out);",
    "}",
  ],
  steps: [
    {
      description:
        "Duyệt giữa (inorder) đi theo đúng thứ tự: CÂY CON TRÁI → GỐC → CÂY CON PHẢI.\nVới cây tìm kiếm nhị phân (BST), thứ tự này cho ra dãy tăng dần — đó là mẹo hay dùng để kiểm tra một cây có phải BST hay không.",
      tree: build(BST),
      treeLabel: "Cây nhị phân tìm kiếm",
      codeLine: 0,
    },
    {
      description:
        "Từ gốc 8, đệ quy đi sâu hết về phía trái: 8 → 3 → 1. Node 1 không còn con trái nữa nên đây là node được THĂM đầu tiên.",
      tree: build(BST, { "8": "visited", "3": "visited", "1": "active" }),
      treeLabel: "Cây nhị phân tìm kiếm",
      output: "1",
      outputLabel: "Dãy inorder",
      codeLine: 3,
    },
    {
      description:
        "Xong cây con trái của node 3 → quay lên thăm chính node 3.",
      tree: build(BST, { "8": "visited", "3": "active", "1": "found" }),
      treeLabel: "Cây nhị phân tìm kiếm",
      output: "1 3",
      outputLabel: "Dãy inorder",
      codeLine: 3,
    },
    {
      description:
        "Sau gốc 3 thì sang cây con phải của nó: node 6. Node 6 là lá nên thăm luôn.",
      tree: build(BST, { "8": "visited", "3": "found", "1": "found", "6": "active" }),
      treeLabel: "Cây nhị phân tìm kiếm",
      output: "1 3 6",
      outputLabel: "Dãy inorder",
      codeLine: 4,
    },
    {
      description:
        "Toàn bộ cây con trái của gốc đã xử lý xong → thăm gốc 8.",
      tree: build(BST, { "8": "active", "3": "found", "1": "found", "6": "found" }),
      treeLabel: "Cây nhị phân tìm kiếm",
      output: "1 3 6 8",
      outputLabel: "Dãy inorder",
      codeLine: 3,
    },
    {
      description:
        "Chuyển sang cây con phải của gốc: node 10. Node 10 không có con trái nên được thăm ngay.",
      tree: build(BST, {
        "8": "found",
        "3": "found",
        "1": "found",
        "6": "found",
        "10": "active",
      }),
      treeLabel: "Cây nhị phân tìm kiếm",
      output: "1 3 6 8 10",
      outputLabel: "Dãy inorder",
      codeLine: 3,
    },
    {
      description: "Cuối cùng là con phải của node 10: node 14.",
      tree: build(BST, {
        "8": "found",
        "3": "found",
        "1": "found",
        "6": "found",
        "10": "found",
        "14": "active",
      }),
      treeLabel: "Cây nhị phân tìm kiếm",
      output: "1 3 6 8 10 14",
      outputLabel: "Dãy inorder",
      codeLine: 4,
    },
    {
      description:
        "Hoàn thành! Kết quả: 1 3 6 8 10 14 — đúng là một dãy tăng dần, xác nhận cây này là BST hợp lệ.\nMỗi node được thăm đúng một lần: thời gian O(n), bộ nhớ O(h) cho ngăn xếp đệ quy (h là chiều cao cây).",
      tree: build(BST, {
        "8": "found",
        "3": "found",
        "1": "found",
        "6": "found",
        "10": "found",
        "14": "found",
      }),
      treeLabel: "Cây nhị phân tìm kiếm",
      output: "1 3 6 8 10 14",
      outputLabel: "Dãy inorder",
      codeLine: 5,
    },
  ],
};

/** TREE02 - Tính chiều cao / độ sâu lớn nhất của cây */
export const treeHeight: VisualizerData = {
  title: "Chiều cao (độ sâu lớn nhất) của cây",
  codeSnippet: [
    "function height(node) {",
    "  if (node === null) return 0;",
    "  const hl = height(node.left);",
    "  const hr = height(node.right);",
    "  return 1 + Math.max(hl, hr);",
    "}",
  ],
  steps: [
    {
      description:
        "Chiều cao của cây = số node trên đường đi dài nhất từ gốc xuống lá.\nCông thức đệ quy rất gọn: height(node) = 1 + max(height(trái), height(phải)), với cây rỗng thì height = 0.",
      tree: build(BST),
      treeLabel: "Tính chiều cao từ dưới lên",
      codeLine: 0,
    },
    {
      description:
        "Bắt đầu ở gốc 8. Chưa thể trả lời ngay — phải biết chiều cao của cả hai cây con trước, nên đệ quy xuống sâu.",
      tree: build(BST, { "8": "active" }, { "8": "h = ?" }),
      treeLabel: "Tính chiều cao từ dưới lên",
      codeLine: 2,
    },
    {
      description:
        "Xuống node 3, cũng chưa trả lời được, tiếp tục xuống hai lá của nó là 1 và 6.",
      tree: build(BST, { "8": "visited", "3": "active" }, { "8": "h = ?", "3": "h = ?" }),
      treeLabel: "Tính chiều cao từ dưới lên",
      codeLine: 2,
    },
    {
      description:
        "Node 1 là lá: hai con đều NULL nên height = 1 + max(0, 0) = 1. Tương tự node 6 cũng có height = 1.\nĐây là điểm dừng của đệ quy (base case).",
      tree: build(
        BST,
        { "8": "visited", "3": "visited", "1": "found", "6": "found" },
        { "1": "h = 1", "6": "h = 1" },
      ),
      treeLabel: "Tính chiều cao từ dưới lên",
      variables: { "height(1)": 1, "height(6)": 1 },
      codeLine: 1,
    },
    {
      description:
        "Có đủ dữ liệu cho node 3: height(3) = 1 + max(1, 1) = 2.\nKết quả được trả ngược lên cho gốc 8.",
      tree: build(
        BST,
        { "8": "visited", "3": "found", "1": "found", "6": "found" },
        { "3": "h = 2", "1": "h = 1", "6": "h = 1" },
      ),
      treeLabel: "Tính chiều cao từ dưới lên",
      variables: { "height(3)": 2 },
      codeLine: 4,
    },
    {
      description:
        "Sang cây con phải: node 10 có con trái NULL (height = 0) và con phải là lá 14 (height = 1).\nVậy height(10) = 1 + max(0, 1) = 2.",
      tree: build(
        BST,
        { "8": "visited", "3": "found", "1": "found", "6": "found", "10": "active", "14": "found" },
        { "3": "h = 2", "10": "h = 2", "14": "h = 1" },
      ),
      treeLabel: "Tính chiều cao từ dưới lên",
      variables: { "height(14)": 1, "height(10)": 2 },
      codeLine: 3,
    },
    {
      description:
        "Cuối cùng tại gốc: height(8) = 1 + max(height(3), height(10)) = 1 + max(2, 2) = 3.\nĐường đi dài nhất ví dụ 8 → 3 → 1, gồm 3 node.",
      tree: build(
        BST,
        {
          "8": "found",
          "3": "found",
          "1": "found",
          "6": "found",
          "10": "found",
          "14": "found",
        },
        { "8": "h = 3", "3": "h = 2", "10": "h = 2", "1": "h = 1", "6": "h = 1", "14": "h = 1" },
      ),
      treeLabel: "Tính chiều cao từ dưới lên",
      variables: { "height(8)": 3 },
      output: "3",
      outputLabel: "Chiều cao",
      codeLine: 4,
    },
    {
      description:
        "Hoàn thành! Chiều cao của cây là 3.\nMỗi node được ghé đúng một lần nên thời gian O(n); bộ nhớ O(h) do ngăn xếp đệ quy. Nếu đề yêu cầu tính theo số CẠNH thay vì số NODE thì đáp án là 3 - 1 = 2, cần đọc kỹ đề.",
      tree: build(
        BST,
        {
          "8": "found",
          "3": "found",
          "1": "found",
          "6": "found",
          "10": "found",
          "14": "found",
        },
        { "8": "h = 3" },
      ),
      treeLabel: "Tính chiều cao từ dưới lên",
      output: "3",
      outputLabel: "Chiều cao",
      codeLine: 4,
    },
  ],
};

/** Cây KHÔNG hợp lệ dùng cho TREE03. */
const BAD_BST: Spec = {
  v: 10,
  l: { v: 5 },
  r: { v: 15, l: { v: 6 }, r: { v: 20 } },
};

/** TREE03 - Kiểm tra tính hợp lệ của BST */
export const treeValidateBst: VisualizerData = {
  title: "Kiểm tra cây nhị phân tìm kiếm hợp lệ (Validate BST)",
  codeSnippet: [
    "function valid(node, low, high) {",
    "  if (node === null) return true;",
    "  if (node.value <= low || node.value >= high)",
    "    return false;",
    "  return valid(node.left, low, node.value)",
    "      && valid(node.right, node.value, high);",
    "}",
  ],
  steps: [
    {
      description:
        "Bẫy kinh điển của bài này: chỉ so sánh node với cha là KHÔNG đủ. Mỗi node phải nằm trong một KHOẢNG hợp lệ được truyền từ tất cả tổ tiên xuống.\nGốc bắt đầu với khoảng (-∞, +∞).",
      tree: build(BAD_BST, { "10": "active" }, { "10": "(-∞, +∞)" }),
      treeLabel: "Cây cần kiểm tra",
      codeLine: 0,
    },
    {
      description:
        "Node 10 nằm trong (-∞, +∞) → hợp lệ. Đi sang con trái với khoảng bị siết lại thành (-∞, 10).",
      tree: build(
        BAD_BST,
        { "10": "visited", "5": "active" },
        { "10": "(-∞, +∞)", "5": "(-∞, 10)" },
      ),
      treeLabel: "Cây cần kiểm tra",
      codeLine: 4,
    },
    {
      description:
        "Node 5 < 10 nên thoả khoảng (-∞, 10) → hợp lệ. Node 5 là lá, cây con trái kiểm tra xong, không có vấn đề.",
      tree: build(
        BAD_BST,
        { "10": "visited", "5": "found" },
        { "5": "(-∞, 10) ✓" },
      ),
      treeLabel: "Cây cần kiểm tra",
      codeLine: 1,
    },
    {
      description:
        "Sang con phải của gốc với khoảng (10, +∞). Node 15 > 10 → hợp lệ.\nTiếp tục xuống con trái của 15, khoảng bị siết thành (10, 15) — vừa lớn hơn 10 (do tổ tiên là gốc) vừa nhỏ hơn 15 (do cha).",
      tree: build(
        BAD_BST,
        { "10": "visited", "5": "found", "15": "active" },
        { "15": "(10, +∞)" },
      ),
      treeLabel: "Cây cần kiểm tra",
      codeLine: 5,
    },
    {
      description:
        "VI PHẠM! Node 6 phải nằm trong khoảng (10, 15) nhưng 6 < 10.\nNếu chỉ so với cha thì 6 < 15 trông như đúng — nhưng 6 đang ở cây con PHẢI của gốc 10, mà mọi node bên phải gốc đều phải lớn hơn 10.",
      tree: build(
        BAD_BST,
        { "10": "visited", "5": "found", "15": "visited", "6": "danger" },
        { "6": "(10, 15) ✗", "10": "gốc = 10" },
      ),
      treeLabel: "Cây cần kiểm tra",
      variables: { "node.value": 6, low: 10, high: 15, "hợp lệ": false },
      codeLine: 2,
    },
    {
      description:
        "Trả về false ngay và dừng đệ quy — không cần kiểm tra node 20 nữa.\nKết luận: cây này KHÔNG phải BST hợp lệ. Độ phức tạp O(n), bộ nhớ O(h).",
      tree: build(
        BAD_BST,
        { "10": "muted", "5": "muted", "15": "muted", "6": "danger", "20": "muted" },
        { "6": "sai khoảng" },
      ),
      treeLabel: "Cây cần kiểm tra",
      output: "false",
      outputLabel: "Kết quả",
      codeLine: 3,
    },
  ],
};

/** TREE04 - Đếm số lượng nút lá */
export const treeCountLeaves: VisualizerData = {
  title: "Đếm số lượng nút lá của cây",
  codeSnippet: [
    "function countLeaves(node) {",
    "  if (node === null) return 0;",
    "  if (!node.left && !node.right) return 1;",
    "  return countLeaves(node.left)",
    "       + countLeaves(node.right);",
    "}",
  ],
  steps: [
    {
      description:
        "Nút lá là node KHÔNG có con nào (cả left và right đều NULL).\nCông thức đệ quy: nếu là lá thì trả về 1, ngược lại trả về tổng số lá của hai cây con.",
      tree: build(BST),
      treeLabel: "Đếm nút lá",
      variables: { count: 0 },
      codeLine: 0,
    },
    {
      description:
        "Tại gốc 8: có cả con trái và con phải nên KHÔNG phải lá. Không cộng gì, đệ quy xuống hai nhánh.",
      tree: build(BST, { "8": "active" }),
      treeLabel: "Đếm nút lá",
      variables: { count: 0 },
      codeLine: 3,
    },
    {
      description: "Tại node 3: cũng có hai con nên không phải lá. Đi tiếp xuống.",
      tree: build(BST, { "8": "visited", "3": "active" }),
      treeLabel: "Đếm nút lá",
      variables: { count: 0 },
      codeLine: 3,
    },
    {
      description: "Node 1: không có con nào → LÀ LÁ. Trả về 1, tổng hiện tại = 1.",
      tree: build(BST, { "8": "visited", "3": "visited", "1": "found" }, { "1": "lá" }),
      treeLabel: "Đếm nút lá",
      variables: { count: 1 },
      codeLine: 2,
    },
    {
      description: "Node 6: cũng không có con → LÀ LÁ. Tổng hiện tại = 2.",
      tree: build(
        BST,
        { "8": "visited", "3": "visited", "1": "found", "6": "found" },
        { "1": "lá", "6": "lá" },
      ),
      treeLabel: "Đếm nút lá",
      variables: { count: 2 },
      codeLine: 2,
    },
    {
      description:
        "Sang nhánh phải. Node 10 có con phải (node 14) nên KHÔNG phải lá — dù nó chỉ có một con.\nĐây là chỗ dễ nhầm: node có 1 con vẫn không phải lá.",
      tree: build(
        BST,
        { "8": "visited", "1": "found", "6": "found", "3": "visited", "10": "active" },
        { "1": "lá", "6": "lá" },
      ),
      treeLabel: "Đếm nút lá",
      variables: { count: 2 },
      codeLine: 3,
    },
    {
      description: "Node 14: không có con → LÀ LÁ. Tổng hiện tại = 3.",
      tree: build(
        BST,
        { "8": "visited", "3": "visited", "1": "found", "6": "found", "10": "visited", "14": "found" },
        { "1": "lá", "6": "lá", "14": "lá" },
      ),
      treeLabel: "Đếm nút lá",
      variables: { count: 3 },
      codeLine: 2,
    },
    {
      description:
        "Hoàn thành! Cây có 3 nút lá: 1, 6 và 14.\nMỗi node được ghé một lần nên thời gian O(n), bộ nhớ O(h).",
      tree: build(
        BST,
        { "1": "found", "6": "found", "14": "found" },
        { "1": "lá", "6": "lá", "14": "lá" },
      ),
      treeLabel: "Đếm nút lá",
      variables: { count: 3 },
      output: "3",
      outputLabel: "Số nút lá",
      codeLine: 4,
    },
  ],
};

/** BST lớn hơn dùng cho TREE05. */
const LCA_BST: Spec = {
  v: 6,
  l: { v: 2, l: { v: 0 }, r: { v: 4, l: { v: 3 }, r: { v: 5 } } },
  r: { v: 8, l: { v: 7 }, r: { v: 9 } },
};

/** TREE05 - Tổ tiên chung thấp nhất (LCA) */
export const treeLca: VisualizerData = {
  title: "Tổ tiên chung thấp nhất (LCA)",
  codeSnippet: [
    "function lca(node, p, q) {",
    "  if (p < node.value && q < node.value)",
    "    return lca(node.left, p, q);",
    "  if (p > node.value && q > node.value)",
    "    return lca(node.right, p, q);",
    "  return node; // p và q tách hướng tại đây",
    "}",
  ],
  steps: [
    {
      description:
        "Cần tìm tổ tiên chung THẤP NHẤT (gần lá nhất) của hai node p = 0 và q = 5.\nVì đây là BST, ta không cần duyệt cả cây: chỉ cần so sánh giá trị để biết nên rẽ trái hay rẽ phải.",
      tree: build(LCA_BST, { "0": "active", "5": "active" }, { "0": "p", "5": "q" }),
      treeLabel: "Cây nhị phân tìm kiếm",
      variables: { p: 0, q: 5 },
      codeLine: 0,
    },
    {
      description:
        "Tại gốc 6: cả p = 0 và q = 5 đều NHỎ HƠN 6 → chắc chắn cả hai nằm trong cây con trái. Rẽ trái sang node 2.",
      tree: build(
        LCA_BST,
        { "6": "visited", "0": "active", "5": "active" },
        { "6": "cả p, q < 6", "0": "p", "5": "q" },
      ),
      treeLabel: "Cây nhị phân tìm kiếm",
      variables: { p: 0, q: 5, "node hiện tại": 6 },
      codeLine: 2,
    },
    {
      description:
        "Tại node 2: p = 0 nhỏ hơn 2 (nằm bên trái) nhưng q = 5 lớn hơn 2 (nằm bên phải).\nHai node TÁCH HƯỚNG ngay tại đây → node 2 chính là tổ tiên chung thấp nhất.",
      tree: build(
        LCA_BST,
        { "6": "visited", "2": "found", "0": "active", "5": "active" },
        { "2": "LCA", "0": "p", "5": "q" },
      ),
      treeLabel: "Cây nhị phân tìm kiếm",
      variables: { p: 0, q: 5, "node hiện tại": 2, "tách hướng": true },
      codeLine: 5,
    },
    {
      description:
        "Kiểm chứng bằng đường đi từ gốc:\n- Tới p = 0: 6 → 2 → 0\n- Tới q = 5: 6 → 2 → 4 → 5\nHai đường đi trùng nhau ở 6 và 2; node chung SÂU NHẤT là 2.",
      tree: build(
        LCA_BST,
        { "6": "visited", "2": "found", "0": "visited", "4": "visited", "5": "visited" },
        { "2": "LCA" },
      ),
      treeLabel: "Cây nhị phân tìm kiếm",
      output: "2",
      outputLabel: "LCA",
      codeLine: 5,
    },
    {
      description:
        "Hoàn thành! LCA(0, 5) = 2.\nCách này chỉ đi theo MỘT đường từ gốc xuống nên thời gian O(h) — với BST cân bằng là O(log n), nhanh hơn hẳn cách duyệt toàn cây O(n) dùng cho cây nhị phân thường.",
      tree: build(LCA_BST, { "2": "found", "0": "active", "5": "active" }, { "2": "LCA" }),
      treeLabel: "Cây nhị phân tìm kiếm",
      output: "2",
      outputLabel: "LCA",
      codeLine: 5,
    },
  ],
};
