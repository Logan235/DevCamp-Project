import { ln, type VisualizerData } from "../types";

/** Two Sum - tìm hai số có tổng bằng target */
export const twoSum: VisualizerData = {
  title: "Hai số có tổng bằng Target (Two Sum)",
  codeSnippet: [
    "const map = new Map();",
    "for (let i = 0; i < nums.length; i++) {",
    "  const complement = target - nums[i];",
    "  if (map.has(complement)) {",
    "    return [map.get(complement), i];",
    "  }",
    "  map.set(nums[i], i);",
    "}",
  ],
  steps: [
    {
      description:
        "Cách trâu bò là thử mọi cặp — O(n²). Mẹo để giảm còn O(n): thay vì đi tìm cặp, ta ĐỔI CÂU HỎI thành 'số bù mà tôi đang cần đã từng gặp chưa?'.\nDùng một Map lưu các số đã duyệt kèm chỉ số. Target = 9.",
      array: [2, 7, 11, 15],
      pointers: { i: 0 },
      activeIndices: [0],
      map: [],
      mapLabel: "Map: giá trị → chỉ số",
      variables: { target: 9, i: 0 },
      codeLine: 0,
    },
    {
      description:
        "i = 0, nums[i] = 2. Số bù cần tìm: complement = target - nums[i] = 9 - 2 = 7.",
      array: [2, 7, 11, 15],
      pointers: { i: 0 },
      activeIndices: [0],
      map: [],
      mapLabel: "Map: giá trị → chỉ số",
      variables: { target: 9, i: 0, "nums[i]": 2, complement: 7 },
      codeLine: 2,
    },
    {
      description:
        "Tra Map xem có 7 chưa — chưa có. Vậy lưu chính số 2 kèm chỉ số 0 vào Map để các bước sau tra được.",
      array: [2, 7, 11, 15],
      pointers: { i: 0 },
      activeIndices: [0],
      map: [{ key: 2, value: 0, state: "active" }],
      mapLabel: "Map: giá trị → chỉ số",
      variables: { target: 9, i: 0, complement: 7 },
      codeLine: 6,
    },
    {
      description:
        "i = 1, nums[i] = 7. complement = 9 - 7 = 2.",
      array: [2, 7, 11, 15],
      pointers: { i: 1 },
      activeIndices: [1],
      visitedIndices: [0],
      map: [{ key: 2, value: 0 }],
      mapLabel: "Map: giá trị → chỉ số",
      variables: { target: 9, i: 1, "nums[i]": 7, complement: 2 },
      codeLine: 2,
    },
    {
      description:
        "Tra Map: có số 2 tại chỉ số 0! Vậy cặp (0, 1) có tổng 2 + 7 = 9.\nTrả về ngay [0, 1] — chỉ mất một lượt duyệt, thời gian O(n), bộ nhớ O(n).\nLưu ý: phải TRA Map TRƯỚC rồi mới lưu số hiện tại, nếu làm ngược lại thì với target = 2 × nums[i] ta sẽ vô tình dùng chính phần tử đó hai lần.",
      array: [2, 7, 11, 15],
      pointers: { i: 1 },
      foundIndices: [0, 1],
      map: [{ key: 2, value: 0, state: "found" }],
      mapLabel: "Map: giá trị → chỉ số",
      variables: { target: 9, i: 1, complement: 2 },
      output: "[0, 1]",
      outputLabel: "Kết quả",
      codeLine: 4,
    },
  ],
};

/** Binary Search - tìm kiếm nhị phân */
export const binarySearch: VisualizerData = {
  title: "Tìm kiếm nhị phân (Binary Search)",
  codeSnippet: [
    "let left = 0, right = nums.length - 1;",
    "while (left <= right) {",
    "  const mid = left + Math.floor((right - left) / 2);",
    "  if (nums[mid] === target) return mid;",
    "  else if (nums[mid] < target) left = mid + 1;",
    "  else right = mid - 1;",
    "}",
    "return -1;",
  ],
  steps: [
    {
      description:
        "Điều kiện tiên quyết: mảng phải ĐÃ SẮP XẾP. Nhờ vậy mỗi lần so sánh ta loại bỏ được một nửa số ứng viên.\nKhởi tạo left = 0, right = 7. Tìm target = 15.",
      array: [1, 3, 5, 8, 12, 15, 23, 38],
      pointers: { left: 0, right: 7 },
      activeIndices: [0, 7],
      variables: { target: 15, left: 0, right: 7 },
      codeLine: 0,
    },
    {
      description:
        "Tính điểm giữa: mid = left + (right - left) / 2 = 3. Giá trị nums[3] = 8.\n(Viết công thức kiểu này thay vì (left + right) / 2 để tránh tràn số khi mảng cực lớn.)",
      array: [1, 3, 5, 8, 12, 15, 23, 38],
      pointers: { left: 0, right: 7, mid: 3 },
      activeIndices: [3],
      variables: { target: 15, left: 0, right: 7, mid: 3, "nums[mid]": 8 },
      codeLine: 2,
    },
    {
      description:
        "nums[mid] = 8 < target = 15 → target chắc chắn nằm ở nửa PHẢI. Bỏ luôn nửa trái: left = mid + 1 = 4.\nChỉ một phép so sánh đã loại 4 phần tử.",
      array: [1, 3, 5, 8, 12, 15, 23, 38],
      pointers: { left: 4, right: 7 },
      activeIndices: [4, 7],
      mutedIndices: [0, 1, 2, 3],
      variables: { target: 15, left: 4, right: 7 },
      codeLine: 4,
    },
    {
      description:
        "Tính lại mid = 4 + (7 - 4) / 2 = 5. Giá trị nums[5] = 15.",
      array: [1, 3, 5, 8, 12, 15, 23, 38],
      pointers: { left: 4, right: 7, mid: 5 },
      activeIndices: [5],
      mutedIndices: [0, 1, 2, 3],
      variables: { target: 15, left: 4, right: 7, mid: 5, "nums[mid]": 15 },
      codeLine: 2,
    },
    {
      description:
        "nums[mid] = 15 đúng bằng target → trả về chỉ số 5.\nChỉ mất 2 lần so sánh cho mảng 8 phần tử. Độ phức tạp O(log n) — với mảng 1 triệu phần tử cũng chỉ khoảng 20 bước.\nHai lỗi kinh điển: dùng 'left < right' thay vì 'left <= right' (bỏ sót phần tử cuối), và cập nhật left = mid thay vì mid + 1 (lặp vô tận).",
      array: [1, 3, 5, 8, 12, 15, 23, 38],
      pointers: { left: 4, right: 7, mid: 5 },
      foundIndices: [5],
      mutedIndices: [0, 1, 2, 3],
      variables: { target: 15, mid: 5 },
      output: "5",
      outputLabel: "Chỉ số tìm được",
      codeLine: 3,
    },
  ],
};

/** 3Sum - tìm bộ ba có tổng bằng 0 */
export const threeSum: VisualizerData = {
  title: "Bộ ba có tổng bằng 0 (3Sum)",
  codeSnippet: [
    "nums.sort((a, b) => a - b);",
    "for (let i = 0; i < n - 2; i++) {",
    "  if (i > 0 && nums[i] === nums[i-1]) continue;",
    "  let L = i + 1, R = n - 1;",
    "  while (L < R) {",
    "    const s = nums[i] + nums[L] + nums[R];",
    "    if (s === 0) { lưu kết quả; L++; R--; }",
    "    else if (s < 0) L++;",
    "    else R--;",
    "  }",
    "}",
  ],
  steps: [
    {
      description:
        "Mảng gốc: [-1, 0, 1, 2, -1, -4]. Cần tìm mọi bộ ba khác nhau có tổng bằng 0.\nBước chuẩn bị bắt buộc: SẮP XẾP mảng. Sắp xếp cho ta hai thứ — dùng được kỹ thuật hai con trỏ, và các giá trị trùng nhau nằm cạnh nhau nên dễ loại nghiệm lặp.",
      array: [-1, 0, 1, 2, -1, -4],
      arrayLabel: "Mảng gốc (chưa sắp xếp)",
      codeLine: 0,
    },
    {
      description:
        "Sau khi sắp xếp: [-4, -1, -1, 0, 1, 2].\nÝ tưởng: cố định phần tử thứ nhất tại i, rồi bài toán còn lại là 'tìm 2 số có tổng bằng -nums[i]' trên đoạn đã sắp xếp — giải bằng hai con trỏ L và R chạy vào giữa.",
      array: [-4, -1, -1, 0, 1, 2],
      arrayLabel: "Mảng đã sắp xếp",
      pointers: { i: 0, L: 1, R: 5 },
      activeIndices: [0],
      codeLine: 3,
    },
    {
      description:
        "i = 0, nums[i] = -4, cần tìm hai số có tổng 4. Tổng lớn nhất có thể của đoạn còn lại là -1 + 2 = 1, luôn nhỏ hơn 4.\nVì tổng < 0, con trỏ L cứ tăng dần (tăng L làm tổng lớn lên) cho tới khi L gặp R. Không có nghiệm nào với -4.",
      array: [-4, -1, -1, 0, 1, 2],
      arrayLabel: "Mảng đã sắp xếp",
      pointers: { i: 0, L: 4, R: 5 },
      activeIndices: [0],
      mutedIndices: [1, 2, 3],
      variables: { "nums[i]": -4, "tổng": "< 0 → L++" },
      codeLine: 7,
    },
    {
      description:
        "i = 1, nums[i] = -1. Đặt L = 2, R = 5: tổng = -1 + (-1) + 2 = 0 → TÌM THẤY bộ ba [-1, -1, 2]!\nSau khi lưu nghiệm, dịch cả hai con trỏ: L++ và R--.",
      array: [-4, -1, -1, 0, 1, 2],
      arrayLabel: "Mảng đã sắp xếp",
      pointers: { i: 1, L: 2, R: 5 },
      foundIndices: [1, 2, 5],
      mutedIndices: [0],
      variables: { "tổng": 0 },
      output: "[-1, -1, 2]",
      outputLabel: "Nghiệm tìm được",
      codeLine: 6,
    },
    {
      description:
        "Vẫn với i = 1, giờ L = 3, R = 4: tổng = -1 + 0 + 1 = 0 → TÌM THẤY bộ ba thứ hai [-1, 0, 1]!\nDịch tiếp thì L = 4 > R = 3 nên vòng while kết thúc.",
      array: [-4, -1, -1, 0, 1, 2],
      arrayLabel: "Mảng đã sắp xếp",
      pointers: { i: 1, L: 3, R: 4 },
      foundIndices: [1, 3, 4],
      mutedIndices: [0],
      variables: { "tổng": 0 },
      output: "[-1, -1, 2], [-1, 0, 1]",
      outputLabel: "Nghiệm tìm được",
      codeLine: 6,
    },
    {
      description:
        "i = 2, nums[2] = -1 — TRÙNG với nums[1] đã xét. Nếu xử lý tiếp, ta sẽ tìm lại đúng nghiệm [-1, 0, 1] một lần nữa.\nVì vậy phải BỎ QUA (continue). Đây là bước dễ quên nhất và là nguyên nhân chính khiến bài này bị sai vì nghiệm lặp.",
      array: [-4, -1, -1, 0, 1, 2],
      arrayLabel: "Mảng đã sắp xếp",
      pointers: { i: 2 },
      mutedIndices: [0, 2],
      activeIndices: [1],
      variables: { "nums[i]": -1, "nums[i-1]": -1, "bỏ qua": true },
      codeLine: 2,
    },
    {
      description:
        "i = 3, nums[i] = 0. L = 4, R = 5: tổng = 0 + 1 + 2 = 3 > 0 → giảm R để tổng nhỏ lại. R = 4 = L nên vòng lặp dừng ngay, không có nghiệm.\nVòng for cũng kết thúc vì i chỉ chạy tới n - 3.",
      array: [-4, -1, -1, 0, 1, 2],
      arrayLabel: "Mảng đã sắp xếp",
      pointers: { i: 3, L: 4, R: 5 },
      activeIndices: [3, 4, 5],
      mutedIndices: [0, 1, 2],
      variables: { "tổng": 3, "hành động": "R--" },
      codeLine: 8,
    },
    {
      description:
        "Hoàn thành! Hai bộ ba thoả mãn: [-1, -1, 2] và [-1, 0, 1].\nĐộ phức tạp: O(n log n) để sắp xếp + O(n²) cho vòng for lồng hai con trỏ = O(n²) — tốt hơn hẳn cách thử ba vòng lặp O(n³).",
      array: [-4, -1, -1, 0, 1, 2],
      arrayLabel: "Mảng đã sắp xếp",
      foundIndices: [1, 2, 3, 4, 5],
      output: "[-1, -1, 2], [-1, 0, 1]",
      outputLabel: "Kết quả",
      codeLine: 10,
    },
  ],
};

/** Group Anagrams - gom nhóm chuỗi đảo chữ */
export const groupAnagrams: VisualizerData = {
  title: "Gom nhóm chuỗi đảo chữ (Group Anagrams)",
  codeSnippet: [
    "const groups = new Map();",
    "for (const w of words) {",
    "  const key = w.split('').sort().join('');",
    "  if (!groups.has(key)) groups.set(key, []);",
    "  groups.get(key).push(w);",
    "}",
    "return [...groups.values()];",
  ],
  steps: [
    {
      description:
        'Đầu vào: ["eat", "tea", "tan", "ate", "nat", "bat"]. Hai từ là đảo chữ của nhau nếu chúng dùng đúng cùng một bộ ký tự.\nCHÌA KHÓA: cần một "dấu vân tay" giống nhau cho mọi từ trong cùng nhóm. Sắp xếp các ký tự của từ chính là dấu vân tay đó — "eat", "tea", "ate" đều cho ra "aet".',
      array: ["eat", "tea", "tan", "ate", "nat", "bat"],
      arrayLabel: "Danh sách từ",
      pointers: { i: 0 },
      activeIndices: [0],
      map: [],
      mapLabel: "Map: khóa đã sắp xếp → nhóm",
      codeLine: 0,
    },
    {
      description: '"eat" → sắp xếp ký tự được khóa "aet". Khóa này chưa có → tạo nhóm mới.',
      array: ["eat", "tea", "tan", "ate", "nat", "bat"],
      arrayLabel: "Danh sách từ",
      pointers: { i: 0 },
      activeIndices: [0],
      map: [{ key: "aet", value: "eat", state: "active" }],
      mapLabel: "Map: khóa đã sắp xếp → nhóm",
      variables: { "từ": "eat", "khóa": "aet" },
      codeLine: 2,
    },
    {
      description: '"tea" → khóa cũng là "aet". Khóa đã tồn tại → thêm vào nhóm sẵn có.',
      array: ["eat", "tea", "tan", "ate", "nat", "bat"],
      arrayLabel: "Danh sách từ",
      pointers: { i: 1 },
      activeIndices: [1],
      visitedIndices: [0],
      map: [{ key: "aet", value: "eat, tea", state: "active" }],
      mapLabel: "Map: khóa đã sắp xếp → nhóm",
      variables: { "từ": "tea", "khóa": "aet" },
      codeLine: 4,
    },
    {
      description: '"tan" → khóa "ant", chưa có → tạo nhóm thứ hai.',
      array: ["eat", "tea", "tan", "ate", "nat", "bat"],
      arrayLabel: "Danh sách từ",
      pointers: { i: 2 },
      activeIndices: [2],
      visitedIndices: [0, 1],
      map: [
        { key: "aet", value: "eat, tea" },
        { key: "ant", value: "tan", state: "active" },
      ],
      mapLabel: "Map: khóa đã sắp xếp → nhóm",
      variables: { "từ": "tan", "khóa": "ant" },
      codeLine: 3,
    },
    {
      description: '"ate" → khóa "aet" → vào nhóm đầu tiên cùng với "eat" và "tea".',
      array: ["eat", "tea", "tan", "ate", "nat", "bat"],
      arrayLabel: "Danh sách từ",
      pointers: { i: 3 },
      activeIndices: [3],
      visitedIndices: [0, 1, 2],
      map: [
        { key: "aet", value: "eat, tea, ate", state: "active" },
        { key: "ant", value: "tan" },
      ],
      mapLabel: "Map: khóa đã sắp xếp → nhóm",
      variables: { "từ": "ate", "khóa": "aet" },
      codeLine: 4,
    },
    {
      description: '"nat" → khóa "ant" → vào nhóm cùng với "tan".',
      array: ["eat", "tea", "tan", "ate", "nat", "bat"],
      arrayLabel: "Danh sách từ",
      pointers: { i: 4 },
      activeIndices: [4],
      visitedIndices: [0, 1, 2, 3],
      map: [
        { key: "aet", value: "eat, tea, ate" },
        { key: "ant", value: "tan, nat", state: "active" },
      ],
      mapLabel: "Map: khóa đã sắp xếp → nhóm",
      variables: { "từ": "nat", "khóa": "ant" },
      codeLine: 4,
    },
    {
      description: '"bat" → khóa "abt", chưa có → tạo nhóm thứ ba chỉ có một phần tử.',
      array: ["eat", "tea", "tan", "ate", "nat", "bat"],
      arrayLabel: "Danh sách từ",
      pointers: { i: 5 },
      activeIndices: [5],
      visitedIndices: [0, 1, 2, 3, 4],
      map: [
        { key: "aet", value: "eat, tea, ate" },
        { key: "ant", value: "tan, nat" },
        { key: "abt", value: "bat", state: "active" },
      ],
      mapLabel: "Map: khóa đã sắp xếp → nhóm",
      variables: { "từ": "bat", "khóa": "abt" },
      codeLine: 3,
    },
    {
      description:
        'Hoàn thành! Ba nhóm: ["eat","tea","ate"], ["tan","nat"], ["bat"].\nĐộ phức tạp O(n × k log k) với n là số từ và k là độ dài từ (chi phí sắp xếp mỗi từ).\nTối ưu thêm: nếu chỉ có 26 chữ cái thường, có thể dùng mảng đếm 26 phần tử làm khóa thay vì sắp xếp, giảm còn O(n × k).',
      array: ["eat", "tea", "tan", "ate", "nat", "bat"],
      arrayLabel: "Danh sách từ",
      foundIndices: [0, 1, 2, 3, 4, 5],
      map: [
        { key: "aet", value: "eat, tea, ate", state: "found" },
        { key: "ant", value: "tan, nat", state: "found" },
        { key: "abt", value: "bat", state: "found" },
      ],
      mapLabel: "Map: khóa đã sắp xếp → nhóm",
      output: "3 nhóm",
      outputLabel: "Kết quả",
      codeLine: 6,
    },
  ],
};

/** Remove Nth Node From End of List */
export const removeNthFromEnd: VisualizerData = {
  title: "Xóa node thứ N từ cuối danh sách",
  codeSnippet: [
    "const dummy = new Node(0); dummy.next = head;",
    "let slow = dummy, fast = dummy;",
    "for (let i = 0; i <= n; i++) fast = fast.next;",
    "while (fast !== null) {",
    "  slow = slow.next; fast = fast.next;",
    "}",
    "slow.next = slow.next.next;",
    "return dummy.next;",
  ],
  steps: [
    {
      description:
        "Danh sách: 1 → 2 → 3 → 4 → 5 → NULL, cần xóa node thứ n = 2 TỪ CUỐI, tức node giá trị 4.\nCái khó: ta không biết độ dài danh sách, mà lại muốn chỉ duyệt MỘT lượt.\nMẹo: dùng hai con trỏ cách nhau đúng một khoảng cố định — khi con trỏ trước chạm NULL thì con trỏ sau đang đứng đúng chỗ cần.",
      list: { nodes: [ln(1, "active", ["slow", "fast"]), ln(2), ln(3), ln(4), ln(5)] },
      variables: { n: 2 },
      codeLine: 1,
    },
    {
      description:
        "Cho fast đi trước n + 1 = 3 bước (đi thêm 1 bước để slow dừng ở node ĐỨNG TRƯỚC node cần xóa, vì muốn xóa thì phải nối lại từ node trước).\nfast giờ ở node 4, slow vẫn ở node 1. Khoảng cách giữa hai con trỏ được giữ cố định từ đây.",
      list: {
        nodes: [ln(1, "active", ["slow"]), ln(2), ln(3), ln(4, "active", ["fast"]), ln(5)],
      },
      variables: { n: 2, "khoảng cách": 3 },
      codeLine: 2,
    },
    {
      description: "Dịch cả hai con trỏ 1 bước: slow → node 2, fast → node 5.",
      list: {
        nodes: [
          ln(1, "visited"),
          ln(2, "active", ["slow"]),
          ln(3),
          ln(4),
          ln(5, "active", ["fast"]),
        ],
      },
      codeLine: 4,
    },
    {
      description:
        "Dịch tiếp: slow → node 3, fast → NULL. Vòng lặp dừng.\nslow đang ở node 3 — chính là node đứng ngay TRƯỚC node 4 cần xóa. Đúng như thiết kế.",
      list: {
        nodes: [
          ln(1, "visited"),
          ln(2, "visited"),
          ln(3, "active", ["slow"]),
          ln(4, "danger"),
          ln(5),
        ],
      },
      variables: { fast: "NULL", "slow.next": 4 },
      codeLine: 3,
    },
    {
      description:
        "Nối tắt: slow.next = slow.next.next, tức node 3 trỏ thẳng sang node 5. Node 4 bị tách ra khỏi chuỗi.",
      list: {
        nodes: [ln(1), ln(2), ln(3, "active", ["slow"]), ln(5, "active")],
        pending: ln(4, "danger"),
        pendingLabel: "Node đã bị tách khỏi chuỗi",
      },
      codeLine: 6,
    },
    {
      description:
        "Hoàn thành! Danh sách: 1 → 2 → 3 → 5 → NULL. Chỉ một lượt duyệt: thời gian O(L), bộ nhớ O(1).\nVÌ SAO CẦN NODE DUMMY: nếu phải xóa chính node đầu (n = độ dài danh sách), slow sẽ cần đứng ở 'node trước head' — thứ không tồn tại. Thêm một node giả phía trước head giúp xử lý trường hợp này giống hệt các trường hợp khác, không cần if riêng.",
      list: {
        nodes: [ln(1, "found", ["head"]), ln(2, "found"), ln(3, "found"), ln(5, "found")],
      },
      output: "1 2 3 5",
      outputLabel: "Danh sách sau khi xóa",
      codeLine: 7,
    },
  ],
};

/** Hello World - bài khởi động */
export const helloWorld: VisualizerData = {
  title: "Hello World — bài khởi động",
  codeSnippet: ["console.log('Hello World');"],
  steps: [
    {
      description:
        "Bài này kiểm tra xem bạn đã chạy được chương trình và ghi ra màn hình chưa. Nghe đơn giản nhưng nó xác nhận cả một chuỗi: viết code → biên dịch/chạy → in ra luồng xuất chuẩn (stdout).",
      output: "",
      outputLabel: "stdout",
      codeLine: 0,
    },
    {
      description:
        "Chương trình gọi lệnh in, chuỗi được đẩy ra luồng xuất chuẩn.\nHệ thống chấm bài sẽ SO SÁNH CHÍNH XÁC TỪNG KÝ TỰ giữa những gì bạn in ra và đáp án mong đợi.",
      output: "Hello World",
      outputLabel: "stdout",
      codeLine: 0,
    },
    {
      description:
        "Hoàn thành! Ba lỗi khiến bài dễ nhất cũng bị sai:\n1. Sai chữ hoa/chữ thường — 'hello world' khác 'Hello World'.\n2. In thêm dấu câu, khoảng trắng ở cuối, hoặc in kèm lời nhắc kiểu 'Nhập tên: '.\n3. Thiếu hoặc thừa dấu xuống dòng cuối cùng.\nKhi bài báo sai mà bạn thấy kết quả 'trông giống', hãy so từng ký tự một.",
      output: "Hello World",
      outputLabel: "stdout",
      codeLine: 0,
    },
  ],
};

/** Trực quan hóa mặc định khi chưa có mô phỏng riêng cho bài toán. */
export function makeFallback(title: string): VisualizerData {
  return {
    title: title || "Mô phỏng luồng thuật toán",
    codeSnippet: [
      "function solveProblem(input) {",
      "  // 1. Phân tích đầu vào & kiểm tra biên",
      "  if (!input) return null;",
      "  ",
      "  // 2. Thực hiện thuật toán tối ưu",
      "  let result = process(input);",
      "  ",
      "  // 3. Trả về kết quả cuối cùng",
      "  return result;",
      "}",
    ],
    steps: [
      {
        description:
          "Bước 1: Bắt đầu thuật toán. Đọc dữ liệu đầu vào từ các trường hợp kiểm thử (test cases) và xác định rõ dữ liệu ra cần có.",
        variables: { isRunning: true, stage: "Khởi tạo" },
        codeLine: 0,
      },
      {
        description:
          "Bước 2: Kiểm tra biên (edge cases) — mảng rỗng, một phần tử, giá trị âm, giá trị trùng nhau, dữ liệu quá lớn. Đây là nơi phần lớn bài bị sai dù ý tưởng chính đã đúng.",
        variables: { isRunning: true, stage: "Kiểm tra biên", isValid: true },
        codeLine: 2,
      },
      {
        description:
          "Bước 3: Thực hiện tính toán chính. Hãy đối chiếu với phần gợi ý tư duy (thinking hints) của bài để chọn đúng cấu trúc dữ liệu và kỹ thuật.",
        variables: { isRunning: true, stage: "Tính toán chính" },
        codeLine: 5,
      },
      {
        description:
          "Bước 4: Hoàn thành. Trước khi nộp, hãy tự ước lượng độ phức tạp thời gian và bộ nhớ, rồi so với giới hạn của đề để chắc chắn giải pháp chạy kịp.",
        variables: { isRunning: false, stage: "Hoàn thành", result: "Thành công" },
        codeLine: 8,
      },
    ],
  };
}
