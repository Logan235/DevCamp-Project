import type { VisualizerData } from "../types";

const KNAP_ROWS = ["–", "A(2,3)", "B(3,4)", "C(4,5)"];
const KNAP_COLS = ["0", "1", "2", "3", "4", "5"];

/** Đánh dấu cả một hàng của bảng DP. */
const rowCells = (r: number, cols: number): [number, number][] =>
  Array.from({ length: cols }, (_, c) => [r, c] as [number, number]);

/** DP01 - Bài toán cái túi (0/1 Knapsack) */
export const dpKnapsack: VisualizerData = {
  title: "Bài toán cái túi (0/1 Knapsack)",
  codeSnippet: [
    "for (let i = 1; i <= n; i++) {",
    "  for (let w = 0; w <= W; w++) {",
    "    dp[i][w] = dp[i - 1][w];            // không lấy",
    "    if (wt[i] <= w) {                    // lấy được",
    "      dp[i][w] = Math.max(dp[i][w],",
    "        val[i] + dp[i - 1][w - wt[i]]);",
    "    }",
    "  }",
    "}",
    "return dp[n][W];",
  ],
  steps: [
    {
      description:
        "Đề bài: túi chịu được tối đa 5kg. Có 3 vật — A (2kg, 3đ), B (3kg, 4đ), C (4kg, 5đ). Mỗi vật chỉ được lấy 0 hoặc 1 lần.\nĐặt dp[i][w] = điểm cao nhất khi chỉ xét i vật đầu và túi còn chịu được w kg. Hàng = vật đang xét, cột = dung lượng túi.",
      grid: {
        cells: [
          [0, 0, 0, 0, 0, 0],
          ["·", "·", "·", "·", "·", "·"],
          ["·", "·", "·", "·", "·", "·"],
          ["·", "·", "·", "·", "·", "·"],
        ],
        rowLabels: KNAP_ROWS,
        colLabels: KNAP_COLS,
        active: rowCells(0, 6),
        caption: "Cột = dung lượng túi (kg) · Hàng = vật đang xét",
      },
      variables: { W: 5, n: 3 },
      codeLine: 0,
    },
    {
      description:
        "Hàng cơ sở: khi chưa xét vật nào thì điểm luôn bằng 0 với mọi dung lượng túi. Đây là điểm tựa để các hàng sau tính dựa vào.",
      grid: {
        cells: [
          [0, 0, 0, 0, 0, 0],
          ["·", "·", "·", "·", "·", "·"],
          ["·", "·", "·", "·", "·", "·"],
          ["·", "·", "·", "·", "·", "·"],
        ],
        rowLabels: KNAP_ROWS,
        colLabels: KNAP_COLS,
        found: rowCells(0, 6),
      },
      codeLine: 0,
    },
    {
      description:
        "Xét vật A (2kg, 3đ). Túi 0kg và 1kg không đủ chỗ → giữ nguyên 0.\nTừ 2kg trở lên thì lấy được A: dp = max(0, 3 + dp[0][w-2]) = 3.\nHàng A: 0 0 3 3 3 3.",
      grid: {
        cells: [
          [0, 0, 0, 0, 0, 0],
          [0, 0, 3, 3, 3, 3],
          ["·", "·", "·", "·", "·", "·"],
          ["·", "·", "·", "·", "·", "·"],
        ],
        rowLabels: KNAP_ROWS,
        colLabels: KNAP_COLS,
        active: rowCells(1, 6),
        visited: rowCells(0, 6),
      },
      variables: { "vật": "A (2kg, 3đ)" },
      codeLine: 4,
    },
    {
      description:
        "Xét vật B (3kg, 4đ). Xem ô quan trọng nhất dp[B][5]:\n- Không lấy B → thừa hưởng dp[A][5] = 3\n- Lấy B → 4 điểm + dp[A][5-3] = dp[A][2] = 3 → tổng 7\nChọn max = 7. Đây chính là chỗ DP tái sử dụng kết quả cũ thay vì thử lại mọi tổ hợp.\nHàng B: 0 0 3 4 4 7.",
      grid: {
        cells: [
          [0, 0, 0, 0, 0, 0],
          [0, 0, 3, 3, 3, 3],
          [0, 0, 3, 4, 4, 7],
          ["·", "·", "·", "·", "·", "·"],
        ],
        rowLabels: KNAP_ROWS,
        colLabels: KNAP_COLS,
        active: [[2, 5]],
        visited: [
          [1, 2],
          [1, 5],
          ...rowCells(2, 5),
        ],
      },
      variables: { "vật": "B (3kg, 4đ)", "dp[B][5]": 7 },
      codeLine: 5,
    },
    {
      description:
        "Xét vật C (4kg, 5đ). Tại dp[C][5]:\n- Không lấy C → 7 (từ hàng B)\n- Lấy C → 5 + dp[B][1] = 5 + 0 = 5\nChọn max = 7, tức là KHÔNG nên lấy C.\nHàng C: 0 0 3 4 5 7.",
      grid: {
        cells: [
          [0, 0, 0, 0, 0, 0],
          [0, 0, 3, 3, 3, 3],
          [0, 0, 3, 4, 4, 7],
          [0, 0, 3, 4, 5, 7],
        ],
        rowLabels: KNAP_ROWS,
        colLabels: KNAP_COLS,
        active: [[3, 5]],
        visited: rowCells(3, 5),
      },
      variables: { "vật": "C (4kg, 5đ)", "dp[C][5]": 7 },
      codeLine: 4,
    },
    {
      description:
        "Đáp án nằm ở ô góc dưới phải: dp[3][5] = 7.\nTruy vết ngược để biết đã chọn vật nào: dp[C][5] = dp[B][5] nên C bị loại; dp[B][5] ≠ dp[A][5] nên B được chọn, còn lại 2kg → dp[A][2] = 3 nên A được chọn.\nVậy phương án tối ưu là A + B: 2 + 3 = 5kg, được 3 + 4 = 7 điểm.",
      grid: {
        cells: [
          [0, 0, 0, 0, 0, 0],
          [0, 0, 3, 3, 3, 3],
          [0, 0, 3, 4, 4, 7],
          [0, 0, 3, 4, 5, 7],
        ],
        rowLabels: KNAP_ROWS,
        colLabels: KNAP_COLS,
        found: [
          [3, 5],
          [2, 5],
          [1, 2],
        ],
      },
      variables: { "kết quả": 7, "chọn": "A + B" },
      output: "7",
      outputLabel: "Điểm tối đa",
      codeLine: 9,
    },
    {
      description:
        "Độ phức tạp: O(n × W) về thời gian và bộ nhớ — nhanh hơn rất nhiều so với thử toàn bộ 2^n tổ hợp.\nLưu ý: đây là độ phức tạp 'giả đa thức' vì phụ thuộc vào GIÁ TRỊ W chứ không chỉ số lượng vật. Có thể rút bộ nhớ về O(W) bằng cách chỉ giữ một hàng và duyệt w từ phải sang trái.",
      grid: {
        cells: [
          [0, 0, 0, 0, 0, 0],
          [0, 0, 3, 3, 3, 3],
          [0, 0, 3, 4, 4, 7],
          [0, 0, 3, 4, 5, 7],
        ],
        rowLabels: KNAP_ROWS,
        colLabels: KNAP_COLS,
        found: [[3, 5]],
      },
      output: "7",
      outputLabel: "Điểm tối đa",
      codeLine: 9,
    },
  ],
};

const LCS_ROWS = ["–", "A", "B", "C", "B"];
const LCS_COLS = ["–", "B", "D", "C", "B"];

/** DP02 - Chuỗi con chung dài nhất (LCS) */
export const dpLcs: VisualizerData = {
  title: "Chuỗi con chung dài nhất (LCS)",
  codeSnippet: [
    "for (let i = 1; i <= m; i++) {",
    "  for (let j = 1; j <= n; j++) {",
    "    if (X[i-1] === Y[j-1])",
    "      dp[i][j] = dp[i-1][j-1] + 1;",
    "    else",
    "      dp[i][j] = Math.max(dp[i-1][j], dp[i][j-1]);",
    "  }",
    "}",
    "return dp[m][n];",
  ],
  steps: [
    {
      description:
        'Hai chuỗi: X = "ABCB" (hàng) và Y = "BDCB" (cột). LCS là dãy ký tự chung xuất hiện theo đúng thứ tự nhưng KHÔNG cần liền nhau.\ndp[i][j] = độ dài LCS của i ký tự đầu X và j ký tự đầu Y. Hàng/cột 0 là chuỗi rỗng nên toàn bộ bằng 0.',
      grid: {
        cells: [
          [0, 0, 0, 0, 0],
          [0, "·", "·", "·", "·"],
          [0, "·", "·", "·", "·"],
          [0, "·", "·", "·", "·"],
          [0, "·", "·", "·", "·"],
        ],
        rowLabels: LCS_ROWS,
        colLabels: LCS_COLS,
        active: rowCells(0, 5),
        caption: 'Hàng = X "ABCB" · Cột = Y "BDCB"',
      },
      codeLine: 0,
    },
    {
      description:
        'Hàng X[1] = "A": ký tự A không xuất hiện trong "BDCB" nên không có ô nào khớp. Mọi ô đều lấy max của ô trên và ô bên trái → vẫn là 0.',
      grid: {
        cells: [
          [0, 0, 0, 0, 0],
          [0, 0, 0, 0, 0],
          [0, "·", "·", "·", "·"],
          [0, "·", "·", "·", "·"],
          [0, "·", "·", "·", "·"],
        ],
        rowLabels: LCS_ROWS,
        colLabels: LCS_COLS,
        active: rowCells(1, 5),
        visited: rowCells(0, 5),
      },
      codeLine: 5,
    },
    {
      description:
        'Hàng X[2] = "B". Tại cột Y[1] = "B" → KHỚP: dp = dp[trên-trái] + 1 = 0 + 1 = 1.\nCác cột còn lại (D, C, B) không khớp hoặc chỉ thừa hưởng giá trị 1 từ bên trái.\nHàng B: 0 1 1 1 1.',
      grid: {
        cells: [
          [0, 0, 0, 0, 0],
          [0, 0, 0, 0, 0],
          [0, 1, 1, 1, 1],
          [0, "·", "·", "·", "·"],
          [0, "·", "·", "·", "·"],
        ],
        rowLabels: LCS_ROWS,
        colLabels: LCS_COLS,
        active: [[2, 1]],
        visited: [
          [2, 2],
          [2, 3],
          [2, 4],
        ],
      },
      variables: { "X[2]": "B", "Y[1]": "B", "khớp": true },
      codeLine: 3,
    },
    {
      description:
        'Hàng X[3] = "C". Tại cột Y[3] = "C" → KHỚP: dp = dp[2][2] + 1 = 1 + 1 = 2 (tức LCS "BC").\nCác ô khác lấy max của ô trên / ô trái.\nHàng C: 0 1 1 2 2.',
      grid: {
        cells: [
          [0, 0, 0, 0, 0],
          [0, 0, 0, 0, 0],
          [0, 1, 1, 1, 1],
          [0, 1, 1, 2, 2],
          [0, "·", "·", "·", "·"],
        ],
        rowLabels: LCS_ROWS,
        colLabels: LCS_COLS,
        active: [[3, 3]],
        visited: [
          [2, 2],
          [3, 1],
          [3, 2],
          [3, 4],
        ],
      },
      variables: { "X[3]": "C", "Y[3]": "C", "khớp": true },
      codeLine: 3,
    },
    {
      description:
        'Hàng X[4] = "B". Tại cột Y[4] = "B" → KHỚP: dp = dp[3][3] + 1 = 2 + 1 = 3 (tức LCS "BCB").\nHàng B: 0 1 1 2 3.',
      grid: {
        cells: [
          [0, 0, 0, 0, 0],
          [0, 0, 0, 0, 0],
          [0, 1, 1, 1, 1],
          [0, 1, 1, 2, 2],
          [0, 1, 1, 2, 3],
        ],
        rowLabels: LCS_ROWS,
        colLabels: LCS_COLS,
        active: [[4, 4]],
        visited: [
          [3, 3],
          [4, 1],
          [4, 2],
          [4, 3],
        ],
      },
      variables: { "X[4]": "B", "Y[4]": "B", "khớp": true },
      codeLine: 3,
    },
    {
      description:
        'Đáp án ở ô góc dưới phải: dp[4][4] = 3.\nTruy vết theo các ô khớp (đường chéo màu xanh) ta đọc ra chuỗi con chung: "BCB".\nĐộ phức tạp O(m × n) thời gian và bộ nhớ; có thể rút bộ nhớ về O(n) nếu chỉ cần độ dài, nhưng muốn truy vết ra chuỗi thì phải giữ cả bảng.',
      grid: {
        cells: [
          [0, 0, 0, 0, 0],
          [0, 0, 0, 0, 0],
          [0, 1, 1, 1, 1],
          [0, 1, 1, 2, 2],
          [0, 1, 1, 2, 3],
        ],
        rowLabels: LCS_ROWS,
        colLabels: LCS_COLS,
        found: [
          [2, 1],
          [3, 3],
          [4, 4],
        ],
      },
      output: '3 ("BCB")',
      outputLabel: "Kết quả",
      codeLine: 8,
    },
  ],
};

/** Climbing Stairs - leo cầu thang (DP một chiều) */
export const dpClimbingStairs: VisualizerData = {
  title: "Leo cầu thang (Climbing Stairs)",
  codeSnippet: [
    "dp[0] = 1; dp[1] = 1;",
    "for (let i = 2; i <= n; i++) {",
    "  dp[i] = dp[i - 1] + dp[i - 2];",
    "}",
    "return dp[n];",
  ],
  steps: [
    {
      description:
        "Đề bài: leo n = 5 bậc, mỗi lần được bước 1 hoặc 2 bậc. Hỏi có bao nhiêu cách?\nNhận xét chìa khóa: để đứng ở bậc i, ta chỉ có thể vừa bước tới từ bậc i-1 hoặc i-2. Vậy dp[i] = dp[i-1] + dp[i-2].\nMảng dưới đây là dp[0..5].",
      array: [1, 1, "·", "·", "·", "·"],
      arrayLabel: "dp[i] = số cách lên tới bậc i",
      foundIndices: [0, 1],
      variables: { n: 5, "dp[0]": 1, "dp[1]": 1 },
      codeLine: 0,
    },
    {
      description:
        "Cơ sở: dp[0] = 1 (đứng yên ở mặt đất cũng tính là 1 cách) và dp[1] = 1 (chỉ có cách bước 1 bậc).",
      array: [1, 1, "·", "·", "·", "·"],
      arrayLabel: "dp[i] = số cách lên tới bậc i",
      foundIndices: [0, 1],
      codeLine: 0,
    },
    {
      description: "dp[2] = dp[1] + dp[0] = 1 + 1 = 2. (Hai cách: 1+1 hoặc 2)",
      array: [1, 1, 2, "·", "·", "·"],
      arrayLabel: "dp[i] = số cách lên tới bậc i",
      pointers: { i: 2 },
      activeIndices: [2],
      visitedIndices: [0, 1],
      variables: { i: 2, "dp[2]": 2 },
      codeLine: 2,
    },
    {
      description: "dp[3] = dp[2] + dp[1] = 2 + 1 = 3.",
      array: [1, 1, 2, 3, "·", "·"],
      arrayLabel: "dp[i] = số cách lên tới bậc i",
      pointers: { i: 3 },
      activeIndices: [3],
      visitedIndices: [1, 2],
      variables: { i: 3, "dp[3]": 3 },
      codeLine: 2,
    },
    {
      description: "dp[4] = dp[3] + dp[2] = 3 + 2 = 5.",
      array: [1, 1, 2, 3, 5, "·"],
      arrayLabel: "dp[i] = số cách lên tới bậc i",
      pointers: { i: 4 },
      activeIndices: [4],
      visitedIndices: [2, 3],
      variables: { i: 4, "dp[4]": 5 },
      codeLine: 2,
    },
    {
      description: "dp[5] = dp[4] + dp[3] = 5 + 3 = 8. Đã tới bậc cần tìm.",
      array: [1, 1, 2, 3, 5, 8],
      arrayLabel: "dp[i] = số cách lên tới bậc i",
      pointers: { i: 5 },
      activeIndices: [5],
      visitedIndices: [3, 4],
      variables: { i: 5, "dp[5]": 8 },
      codeLine: 2,
    },
    {
      description:
        "Hoàn thành! Có 8 cách leo 5 bậc.\nDãy 1, 1, 2, 3, 5, 8 chính là dãy Fibonacci — nên bài này còn giải được bằng 2 biến thay cho cả mảng, đưa bộ nhớ từ O(n) về O(1). Thời gian O(n).",
      array: [1, 1, 2, 3, 5, 8],
      arrayLabel: "dp[i] = số cách lên tới bậc i",
      foundIndices: [5],
      visitedIndices: [0, 1, 2, 3, 4],
      output: "8",
      outputLabel: "Số cách",
      codeLine: 4,
    },
  ],
};
