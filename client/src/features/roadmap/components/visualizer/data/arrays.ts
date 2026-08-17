import type { VisualizerData } from "../types";

/** ARR01 - Tìm số lớn nhất và nhỏ nhất trong mảng */
export const arrMinMax: VisualizerData = {
  title: "Tìm số lớn nhất & nhỏ nhất trong mảng",
  codeSnippet: [
    "let min = nums[0], max = nums[0];",
    "for (let i = 1; i < nums.length; i++) {",
    "  if (nums[i] < min) min = nums[i];",
    "  if (nums[i] > max) max = nums[i];",
    "}",
    "return [max, min];",
  ],
  steps: [
    {
      description:
        "Khởi tạo: gán min và max ban đầu bằng phần tử đầu tiên của mảng (nums[0] = 1). Bắt đầu so sánh từ chỉ số i = 1.\n(Trạng thái: min = 1, max = 1)",
      array: [1, 5, 3, 9, 2],
      pointers: { i: 0, min: 0, max: 0 },
      activeIndices: [0],
      variables: { min: 1, max: 1, i: 0 },
      codeLine: 0,
    },
    {
      description:
        "Duyệt i = 1 (giá trị = 5). So sánh 5 với min (1) và max (1). Vì 5 > 1 nên cập nhật max mới là 5.\n(Trạng thái: min = 1, max = 5)",
      array: [1, 5, 3, 9, 2],
      pointers: { i: 1, min: 0, max: 1 },
      activeIndices: [1],
      variables: { min: 1, max: 5, i: 1 },
      codeLine: 3,
    },
    {
      description:
        "Duyệt i = 2 (giá trị = 3). So sánh 3 với min (1) và max (5). Vì 3 nằm trong khoảng [1, 5] nên min và max giữ nguyên.\n(Trạng thái: min = 1, max = 5)",
      array: [1, 5, 3, 9, 2],
      pointers: { i: 2, min: 0, max: 1 },
      activeIndices: [2],
      variables: { min: 1, max: 5, i: 2 },
      codeLine: 1,
    },
    {
      description:
        "Duyệt i = 3 (giá trị = 9). So sánh 9 với min (1) và max (5). Vì 9 > 5 nên cập nhật max mới là 9.\n(Trạng thái: min = 1, max = 9)",
      array: [1, 5, 3, 9, 2],
      pointers: { i: 3, min: 0, max: 3 },
      activeIndices: [3],
      variables: { min: 1, max: 9, i: 3 },
      codeLine: 3,
    },
    {
      description:
        "Duyệt i = 4 (giá trị = 2). So sánh 2 với min (1) và max (9). Vì 2 nằm trong khoảng [1, 9] nên min và max giữ nguyên.\n(Trạng thái: min = 1, max = 9)",
      array: [1, 5, 3, 9, 2],
      pointers: { i: 4, min: 0, max: 3 },
      activeIndices: [4],
      variables: { min: 1, max: 9, i: 4 },
      codeLine: 1,
    },
    {
      description:
        "Hoàn thành! Đã duyệt qua toàn bộ mảng chỉ với 1 vòng lặp — độ phức tạp O(n).\n- Số nhỏ nhất (min) là 1 tại chỉ số 0.\n- Số lớn nhất (max) là 9 tại chỉ số 3.",
      array: [1, 5, 3, 9, 2],
      pointers: { min: 0, max: 3 },
      foundIndices: [0, 3],
      variables: { min: 1, max: 9 },
      output: "9 1",
      outputLabel: "Kết quả",
      codeLine: 5,
    },
  ],
};

/** ARR02 - Đảo ngược mảng tại chỗ (O(1) bộ nhớ) */
export const arrReverse: VisualizerData = {
  title: "Đảo ngược mảng tại chỗ (Two Pointers)",
  codeSnippet: [
    "let L = 0, R = nums.length - 1;",
    "while (L < R) {",
    "  const temp = nums[L];",
    "  nums[L] = nums[R];",
    "  nums[R] = temp;",
    "  L++; R--;",
    "}",
  ],
  steps: [
    {
      description:
        "Ý tưởng: dùng hai con trỏ ở hai đầu rồi hoán đổi dần vào giữa. Cách này không cần mảng phụ nên chỉ tốn O(1) bộ nhớ.\nKhởi tạo L = 0 (đầu mảng) và R = 4 (cuối mảng).",
      array: [1, 2, 3, 4, 5],
      pointers: { L: 0, R: 4 },
      activeIndices: [0, 4],
      variables: { L: 0, R: 4 },
      codeLine: 0,
    },
    {
      description:
        "L < R nên tiến hành hoán đổi nums[L] = 1 với nums[R] = 5 thông qua biến tạm temp.\nMảng trở thành [5, 2, 3, 4, 1].",
      array: [5, 2, 3, 4, 1],
      pointers: { L: 0, R: 4 },
      foundIndices: [0, 4],
      variables: { L: 0, R: 4, temp: 1 },
      codeLine: 3,
    },
    {
      description:
        "Hai phần tử ngoài cùng đã đúng vị trí. Thu hẹp phạm vi: L tăng lên 1, R giảm còn 3.",
      array: [5, 2, 3, 4, 1],
      pointers: { L: 1, R: 3 },
      activeIndices: [1, 3],
      foundIndices: [0, 4],
      variables: { L: 1, R: 3 },
      codeLine: 5,
    },
    {
      description:
        "Hoán đổi nums[1] = 2 với nums[3] = 4.\nMảng trở thành [5, 4, 3, 2, 1].",
      array: [5, 4, 3, 2, 1],
      pointers: { L: 1, R: 3 },
      foundIndices: [0, 1, 3, 4],
      variables: { L: 1, R: 3, temp: 2 },
      codeLine: 3,
    },
    {
      description:
        "L tăng lên 2, R giảm còn 2. Lúc này L == R nên điều kiện L < R sai — phần tử giữa không cần đổi vì nó đã ở đúng chỗ.\nVòng lặp kết thúc.",
      array: [5, 4, 3, 2, 1],
      pointers: { L: 2, R: 2 },
      activeIndices: [2],
      foundIndices: [0, 1, 3, 4],
      variables: { L: 2, R: 2 },
      codeLine: 1,
    },
    {
      description:
        "Hoàn thành! Mảng đã được đảo ngược ngay trên bộ nhớ gốc. Số lần hoán đổi là n/2 nên độ phức tạp thời gian O(n), bộ nhớ O(1).",
      array: [5, 4, 3, 2, 1],
      foundIndices: [0, 1, 2, 3, 4],
      output: "5 4 3 2 1",
      outputLabel: "Kết quả",
      codeLine: 6,
    },
  ],
};

/** ARR03 - Tìm tần suất xuất hiện và số xuất hiện nhiều nhất */
export const arrFrequency: VisualizerData = {
  title: "Tần suất xuất hiện & phần tử phổ biến nhất",
  codeSnippet: [
    "const freq = new Map();",
    "for (const x of nums) {",
    "  freq.set(x, (freq.get(x) || 0) + 1);",
    "}",
    "let best = null;",
    "for (const [k, v] of freq) {",
    "  if (best === null || v > freq.get(best)) best = k;",
    "}",
    "return best;",
  ],
  steps: [
    {
      description:
        "Ý tưởng: dùng một bảng băm (Map) để đếm số lần xuất hiện của từng giá trị. Chỉ cần duyệt mảng một lượt là có toàn bộ tần suất — O(n).\nKhởi tạo bảng đếm rỗng.",
      array: [3, 1, 3, 2, 3, 1],
      pointers: { i: 0 },
      activeIndices: [0],
      map: [],
      mapLabel: "Bảng tần suất freq",
      variables: { i: 0 },
      codeLine: 0,
    },
    {
      description:
        "i = 0, giá trị 3. Bảng chưa có khóa 3 nên tạo mới với số đếm = 1.",
      array: [3, 1, 3, 2, 3, 1],
      pointers: { i: 0 },
      activeIndices: [0],
      map: [{ key: 3, value: 1, state: "active" }],
      mapLabel: "Bảng tần suất freq",
      variables: { i: 0, "freq[3]": 1 },
      codeLine: 2,
    },
    {
      description:
        "i = 1, giá trị 1. Khóa 1 chưa tồn tại nên thêm vào với số đếm = 1.",
      array: [3, 1, 3, 2, 3, 1],
      pointers: { i: 1 },
      activeIndices: [1],
      visitedIndices: [0],
      map: [
        { key: 3, value: 1 },
        { key: 1, value: 1, state: "active" },
      ],
      mapLabel: "Bảng tần suất freq",
      variables: { i: 1, "freq[1]": 1 },
      codeLine: 2,
    },
    {
      description:
        "i = 2, giá trị 3. Khóa 3 đã có sẵn nên chỉ cần tăng số đếm: 1 → 2.",
      array: [3, 1, 3, 2, 3, 1],
      pointers: { i: 2 },
      activeIndices: [2],
      visitedIndices: [0, 1],
      map: [
        { key: 3, value: 2, state: "active" },
        { key: 1, value: 1 },
      ],
      mapLabel: "Bảng tần suất freq",
      variables: { i: 2, "freq[3]": 2 },
      codeLine: 2,
    },
    {
      description: "i = 3, giá trị 2. Thêm khóa 2 với số đếm = 1.",
      array: [3, 1, 3, 2, 3, 1],
      pointers: { i: 3 },
      activeIndices: [3],
      visitedIndices: [0, 1, 2],
      map: [
        { key: 3, value: 2 },
        { key: 1, value: 1 },
        { key: 2, value: 1, state: "active" },
      ],
      mapLabel: "Bảng tần suất freq",
      variables: { i: 3, "freq[2]": 1 },
      codeLine: 2,
    },
    {
      description: "i = 4, giá trị 3. Tăng số đếm của khóa 3: 2 → 3.",
      array: [3, 1, 3, 2, 3, 1],
      pointers: { i: 4 },
      activeIndices: [4],
      visitedIndices: [0, 1, 2, 3],
      map: [
        { key: 3, value: 3, state: "active" },
        { key: 1, value: 1 },
        { key: 2, value: 1 },
      ],
      mapLabel: "Bảng tần suất freq",
      variables: { i: 4, "freq[3]": 3 },
      codeLine: 2,
    },
    {
      description:
        "i = 5, giá trị 1. Tăng số đếm của khóa 1: 1 → 2. Đã duyệt hết mảng.",
      array: [3, 1, 3, 2, 3, 1],
      pointers: { i: 5 },
      activeIndices: [5],
      visitedIndices: [0, 1, 2, 3, 4],
      map: [
        { key: 3, value: 3 },
        { key: 1, value: 2, state: "active" },
        { key: 2, value: 1 },
      ],
      mapLabel: "Bảng tần suất freq",
      variables: { i: 5, "freq[1]": 2 },
      codeLine: 2,
    },
    {
      description:
        "Quét bảng tần suất để tìm khóa có số đếm lớn nhất: 3 → 3 lần, 1 → 2 lần, 2 → 1 lần.\nKết luận: giá trị 3 xuất hiện nhiều nhất (3 lần), tại các chỉ số 0, 2 và 4.",
      array: [3, 1, 3, 2, 3, 1],
      foundIndices: [0, 2, 4],
      map: [
        { key: 3, value: 3, state: "found" },
        { key: 1, value: 2 },
        { key: 2, value: 1 },
      ],
      mapLabel: "Bảng tần suất freq",
      variables: { best: 3, count: 3 },
      output: "3 (xuất hiện 3 lần)",
      outputLabel: "Kết quả",
      codeLine: 8,
    },
  ],
};

/** ARR04 - Dịch phải xoay vòng mảng K phần tử */
export const arrRotate: VisualizerData = {
  title: "Dịch phải xoay vòng mảng K phần tử",
  codeSnippet: [
    "k = k % n;",
    "reverse(nums, 0, n - 1);   // đảo toàn mảng",
    "reverse(nums, 0, k - 1);   // đảo k phần tử đầu",
    "reverse(nums, k, n - 1);   // đảo n-k phần tử còn lại",
  ],
  steps: [
    {
      description:
        "Đề bài: dịch phải xoay vòng mảng 7 phần tử với k = 3, kết quả mong đợi là [5, 6, 7, 1, 2, 3, 4].\nMẹo hay: chỉ cần đảo ngược 3 lần là xong, không cần mảng phụ (O(1) bộ nhớ).",
      array: [1, 2, 3, 4, 5, 6, 7],
      variables: { n: 7, k: 3 },
      codeLine: 0,
    },
    {
      description:
        "Lưu ý k có thể lớn hơn n, nên rút gọn trước: k = k % n = 3 % 7 = 3.\nBa phần tử cuối [5, 6, 7] chính là những phần tử sẽ nhảy lên đầu mảng.",
      array: [1, 2, 3, 4, 5, 6, 7],
      activeIndices: [4, 5, 6],
      variables: { n: 7, k: 3 },
      codeLine: 0,
    },
    {
      description:
        "Bước 1 — đảo ngược toàn bộ mảng.\n[1,2,3,4,5,6,7] → [7,6,5,4,3,2,1]. Sau bước này nhóm phần tử cần lên đầu đã nằm ở đầu, chỉ có thứ tự nội bộ bị ngược.",
      array: [7, 6, 5, 4, 3, 2, 1],
      activeIndices: [0, 1, 2, 3, 4, 5, 6],
      variables: { n: 7, k: 3 },
      codeLine: 1,
    },
    {
      description:
        "Bước 2 — đảo ngược k = 3 phần tử đầu tiên.\n[7,6,5] → [5,6,7]. Nửa đầu giờ đã đúng thứ tự cần có.",
      array: [5, 6, 7, 4, 3, 2, 1],
      activeIndices: [0, 1, 2],
      mutedIndices: [3, 4, 5, 6],
      variables: { n: 7, k: 3 },
      codeLine: 2,
    },
    {
      description:
        "Bước 3 — đảo ngược n - k = 4 phần tử còn lại.\n[4,3,2,1] → [1,2,3,4].",
      array: [5, 6, 7, 1, 2, 3, 4],
      activeIndices: [3, 4, 5, 6],
      foundIndices: [0, 1, 2],
      variables: { n: 7, k: 3 },
      codeLine: 3,
    },
    {
      description:
        "Hoàn thành! Mảng đã xoay đúng: [5, 6, 7, 1, 2, 3, 4].\nMỗi phần tử được chạm tối đa 2 lần nên thời gian O(n), bộ nhớ O(1).",
      array: [5, 6, 7, 1, 2, 3, 4],
      foundIndices: [0, 1, 2, 3, 4, 5, 6],
      output: "5 6 7 1 2 3 4",
      outputLabel: "Kết quả",
      codeLine: 3,
    },
  ],
};

/** ARR05 - Tổng mảng con liên tiếp lớn nhất (Kadane) */
export const arrKadane: VisualizerData = {
  title: "Tổng mảng con liên tiếp lớn nhất (Kadane)",
  codeSnippet: [
    "let cur = nums[0], best = nums[0];",
    "for (let i = 1; i < nums.length; i++) {",
    "  cur = Math.max(nums[i], cur + nums[i]);",
    "  best = Math.max(best, cur);",
    "}",
    "return best;",
  ],
  steps: [
    {
      description:
        "Ý tưởng Kadane: tại mỗi phần tử chỉ cần trả lời một câu hỏi — nối tiếp mảng con đang có, hay bỏ hết và bắt đầu lại từ chính phần tử này?\nKhởi tạo cur = best = nums[0] = -2.",
      array: [-2, 1, -3, 4, -1, 2, 1, -5, 4],
      pointers: { i: 0 },
      activeIndices: [0],
      visitedIndices: [0],
      variables: { cur: -2, best: -2 },
      codeLine: 0,
    },
    {
      description:
        "i = 1 (giá trị 1). So sánh: bắt đầu lại từ 1 được 1, hay nối tiếp được cur + 1 = -1?\nChọn 1 → cur = 1, mảng con hiện tại khởi động lại tại chỉ số 1. best = max(-2, 1) = 1.",
      array: [-2, 1, -3, 4, -1, 2, 1, -5, 4],
      pointers: { i: 1 },
      activeIndices: [1],
      visitedIndices: [1],
      variables: { cur: 1, best: 1 },
      codeLine: 2,
    },
    {
      description:
        "i = 2 (giá trị -3). Bắt đầu lại được -3, nối tiếp được 1 + (-3) = -2.\nChọn -2 → cur = -2, mảng con hiện tại là [1, -3]. best vẫn là 1.",
      array: [-2, 1, -3, 4, -1, 2, 1, -5, 4],
      pointers: { i: 2 },
      activeIndices: [2],
      visitedIndices: [1, 2],
      variables: { cur: -2, best: 1 },
      codeLine: 2,
    },
    {
      description:
        "i = 3 (giá trị 4). Bắt đầu lại được 4, nối tiếp được -2 + 4 = 2.\nChọn 4 → cur = 4, cắt bỏ phần âm phía trước. best = max(1, 4) = 4.",
      array: [-2, 1, -3, 4, -1, 2, 1, -5, 4],
      pointers: { i: 3 },
      activeIndices: [3],
      visitedIndices: [3],
      variables: { cur: 4, best: 4 },
      codeLine: 2,
    },
    {
      description:
        "i = 4 (giá trị -1). Nối tiếp được 4 + (-1) = 3 > -1 nên giữ mảng con [4, -1], cur = 3.\nbest vẫn là 4 (chưa vượt qua được).",
      array: [-2, 1, -3, 4, -1, 2, 1, -5, 4],
      pointers: { i: 4 },
      activeIndices: [4],
      visitedIndices: [3, 4],
      variables: { cur: 3, best: 4 },
      codeLine: 2,
    },
    {
      description:
        "i = 5 (giá trị 2). Nối tiếp được 3 + 2 = 5 → cur = 5, mảng con [4, -1, 2].\nbest = max(4, 5) = 5.",
      array: [-2, 1, -3, 4, -1, 2, 1, -5, 4],
      pointers: { i: 5 },
      activeIndices: [5],
      visitedIndices: [3, 4, 5],
      variables: { cur: 5, best: 5 },
      codeLine: 3,
    },
    {
      description:
        "i = 6 (giá trị 1). Nối tiếp được 5 + 1 = 6 → cur = 6, mảng con [4, -1, 2, 1].\nbest = max(5, 6) = 6 — đây sẽ là đáp án cuối cùng.",
      array: [-2, 1, -3, 4, -1, 2, 1, -5, 4],
      pointers: { i: 6 },
      activeIndices: [6],
      visitedIndices: [3, 4, 5, 6],
      variables: { cur: 6, best: 6 },
      codeLine: 3,
    },
    {
      description:
        "i = 7 (giá trị -5). Nối tiếp được 6 + (-5) = 1 > -5 nên cur = 1.\nbest vẫn giữ 6 — điểm hay của Kadane là best không bao giờ bị giảm.",
      array: [-2, 1, -3, 4, -1, 2, 1, -5, 4],
      pointers: { i: 7 },
      activeIndices: [7],
      visitedIndices: [3, 4, 5, 6, 7],
      variables: { cur: 1, best: 6 },
      codeLine: 3,
    },
    {
      description:
        "i = 8 (giá trị 4). Nối tiếp được 1 + 4 = 5 → cur = 5. best = max(6, 5) = 6, không đổi.\nĐã duyệt hết mảng.",
      array: [-2, 1, -3, 4, -1, 2, 1, -5, 4],
      pointers: { i: 8 },
      activeIndices: [8],
      visitedIndices: [3, 4, 5, 6, 7, 8],
      variables: { cur: 5, best: 6 },
      codeLine: 3,
    },
    {
      description:
        "Hoàn thành! Tổng lớn nhất là 6, ứng với mảng con liên tiếp [4, -1, 2, 1] (chỉ số 3 đến 6).\nChỉ một vòng lặp và hai biến — thời gian O(n), bộ nhớ O(1).",
      array: [-2, 1, -3, 4, -1, 2, 1, -5, 4],
      foundIndices: [3, 4, 5, 6],
      variables: { best: 6 },
      output: "6",
      outputLabel: "Kết quả",
      codeLine: 5,
    },
  ],
};
