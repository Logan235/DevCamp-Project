// Nội dung lý thuyết cho trang "Lý thuyết", tổ chức theo từng DẠNG BÀI của DSA.
// Mỗi topic là một box trên trang: gồm phần lý thuyết (bản chất, dấu hiệu nhận
// dạng, khuôn mẫu code, lỗi thường gặp) và danh sách bài mô phỏng. Mỗi bài mô
// phỏng trỏ tới một bộ dữ liệu trong visualizer/registry thông qua `slug`
// (mã bài như "arr02") hoặc từ khóa (như "two_sum").

export type TheoryDemo = {
  /** Khóa để registry giải ra bộ dữ liệu trực quan hóa. */
  slug: string;
  /** Nhãn hiển thị trên tab chọn bài. */
  label: string;
};

export type TheorySection = {
  heading: string;
  /** Mỗi phần tử là một gạch đầu dòng. */
  points: string[];
};

export type TheoryTopic = {
  id: string;
  title: string;
  tagline: string;
  /** Tên icon trong lucide-react, được map ở TheoryPage. */
  icon: string;
  /** Tông màu chủ đạo của box (viền, chip, tiêu đề). */
  accent: "blue" | "emerald" | "violet" | "amber" | "rose" | "cyan" | "indigo";
  /** Chip độ phức tạp tiêu biểu của dạng bài. */
  complexity: { time: string; space: string };
  /** Dấu hiệu nhận dạng: đề bài nói gì thì nghĩ tới dạng này. */
  signals: string[];
  sections: TheorySection[];
  /** Khuôn mẫu code C++ cốt lõi của dạng bài. */
  template: string;
  pitfalls: string[];
  demos: TheoryDemo[];
};

export const theoryTopics: TheoryTopic[] = [
  {
    id: "array-two-pointers",
    title: "Mảng & Hai con trỏ",
    tagline: "Quét mảng một lượt, dùng chỉ số thay cho vòng lặp lồng nhau.",
    icon: "LayoutGrid",
    accent: "blue",
    complexity: { time: "O(n)", space: "O(1)" },
    signals: [
      "Đề cho một mảng và hỏi max / min / tổng / đếm trên toàn mảng.",
      "Yêu cầu xử lý tại chỗ (in-place), không được dùng mảng phụ.",
      "Mảng đã sắp xếp và cần tìm cặp / bộ ba thỏa điều kiện tổng.",
      "Cần đảo, xoay, hoặc dồn phần tử về một phía.",
    ],
    sections: [
      {
        heading: "Bản chất",
        points: [
          "Mảng lưu các phần tử liên tiếp trong bộ nhớ nên truy cập theo chỉ số là O(1), nhưng chèn/xóa giữa mảng là O(n) vì phải dịch phần tử.",
          "Kỹ thuật hai con trỏ thay một vòng lặp lồng O(n^2) bằng hai chỉ số cùng di chuyển trong một lượt quét O(n).",
          "Hai biến thể chính: hai đầu chạy vào giữa (left/right — cho mảng đã sắp xếp, bài đảo mảng) và cùng chiều (slow/fast — cho bài lọc, dồn phần tử).",
        ],
      },
      {
        heading: "Quy trình làm bài",
        points: [
          "Xác định bất biến (invariant): tại mọi thời điểm, đoạn [0, slow) đang giữ điều gì?",
          "Chọn điều kiện dịch con trỏ sao cho bất biến vẫn đúng sau mỗi bước.",
          "Kiểm tra biên: mảng rỗng, mảng một phần tử, mọi phần tử giống nhau.",
        ],
      },
      {
        heading: "Kỹ thuật họ hàng",
        points: [
          "Tổng tiền tố (prefix sum): trả lời tổng của một đoạn con trong O(1) sau tiền xử lý O(n).",
          "Cửa sổ trượt (sliding window): dành cho bài đoạn con liên tiếp thỏa điều kiện.",
          "Kadane: quy hoạch động một biến cho bài tổng đoạn con lớn nhất.",
        ],
      },
    ],
    template: `// Hai con trỏ từ hai đầu — đảo mảng tại chỗ
int l = 0, r = n - 1;
while (l < r) {
    swap(a[l], a[r]);
    ++l; --r;
}

// Hai con trỏ cùng chiều — dồn phần tử thỏa điều kiện về đầu
int slow = 0;
for (int fast = 0; fast < n; ++fast) {
    if (ok(a[fast])) a[slow++] = a[fast];
}
// Đoạn [0, slow) chính là kết quả`,
    pitfalls: [
      "Áp dụng kỹ thuật hai đầu cho mảng CHƯA sắp xếp — kết quả sai một cách im lặng.",
      "Khởi tạo max/min bằng 0 thay vì bằng a[0] → sai khi mảng toàn số âm.",
      "Xoay mảng K bước mà không lấy K modulo n → truy cập ngoài mảng khi K > n.",
    ],
    demos: [
      { slug: "arr01", label: "Tìm max & min" },
      { slug: "arr02", label: "Đảo ngược mảng" },
      { slug: "arr04", label: "Xoay vòng K bước" },
      { slug: "arr05", label: "Kadane — tổng đoạn con lớn nhất" },
      { slug: "two_sum", label: "Two Sum" },
      { slug: "three_sum", label: "3Sum" },
    ],
  },

  {
    id: "hashing",
    title: "Băm & Đếm tần suất",
    tagline: "Đổi thời gian tìm kiếm O(n) thành O(1) bằng bảng băm.",
    icon: "Hash",
    accent: "cyan",
    complexity: { time: "O(n)", space: "O(n)" },
    signals: [
      "Đề hỏi phần tử xuất hiện nhiều nhất, hoặc đếm số lần xuất hiện.",
      "Cần kiểm tra đã từng gặp giá trị này chưa trong lúc đang quét.",
      "Gom nhóm các phần tử có cùng một đặc trưng (anagram, cùng số dư...).",
      "Tìm phần tử trùng lặp, hoặc phần tử chỉ xuất hiện đúng một lần.",
    ],
    sections: [
      {
        heading: "Bản chất",
        points: [
          "Bảng băm biến giá trị thành chỉ số lưu trữ, cho phép thêm và tra cứu trung bình O(1) — đánh đổi bộ nhớ để lấy tốc độ.",
          "Trong C++: unordered_map (băm, O(1) trung bình) và map (cây đỏ-đen, O(log n) nhưng khóa có thứ tự).",
          "Mẫu tra cứu trong lúc quét: với mỗi phần tử, hỏi bảng băm về phần bù cần tìm TRƯỚC khi thêm chính nó vào — đây là lời giải O(n) của Two Sum.",
        ],
      },
      {
        heading: "Thiết kế khóa (key)",
        points: [
          "Khóa phải là đặc trưng bất biến của cả nhóm: với anagram, khóa là chuỗi đã sắp xếp ký tự, hoặc vector 26 phần tử đếm ký tự.",
          "Khóa tốt = hai phần tử cùng nhóm luôn cho cùng khóa, hai phần tử khác nhóm gần như không bao giờ trùng khóa.",
        ],
      },
      {
        heading: "Khi nào KHÔNG dùng",
        points: [
          "Miền giá trị nhỏ và biết trước (ví dụ 'a' đến 'z', hoặc 0 đến 1000): dùng mảng đếm nhanh và nhẹ hơn bảng băm.",
          "Cần lấy phần tử theo thứ tự tăng dần: dùng map hoặc sắp xếp, vì unordered_map không giữ thứ tự.",
        ],
      },
    ],
    template: `// Đếm tần suất
unordered_map<int, int> cnt;
for (int x : a) ++cnt[x];

int best = a[0];
for (auto& [value, freq] : cnt)
    if (freq > cnt[best] || (freq == cnt[best] && value < best))
        best = value;

// Tra cứu phần bù trong lúc quét (Two Sum)
unordered_map<int, int> seen;   // value -> index
for (int i = 0; i < n; ++i) {
    int need = target - a[i];
    if (seen.count(need)) return {seen[need], i};
    seen[a[i]] = i;
}`,
    pitfalls: [
      "cnt[x] trên map/unordered_map tự tạo phần tử mới giá trị 0 — dùng .count() hoặc .find() khi chỉ muốn kiểm tra tồn tại.",
      "Thêm phần tử hiện tại vào bảng TRƯỚC khi tra cứu → tự ghép phần tử với chính nó.",
      "Quên xử lý tie-break khi nhiều phần tử có cùng tần suất lớn nhất.",
    ],
    demos: [
      { slug: "arr03", label: "Tần suất & phần tử phổ biến nhất" },
      { slug: "anagram", label: "Gom nhóm chuỗi đảo chữ" },
      { slug: "two_sum", label: "Two Sum bằng Hash Map" },
    ],
  },

  {
    id: "binary-search",
    title: "Tìm kiếm nhị phân",
    tagline: "Mỗi phép so sánh loại bỏ một nửa không gian tìm kiếm.",
    icon: "Crosshair",
    accent: "emerald",
    complexity: { time: "O(log n)", space: "O(1)" },
    signals: [
      "Dữ liệu đã sắp xếp (hoặc có thể sắp xếp) và cần tìm một giá trị.",
      "Đề yêu cầu độ phức tạp O(log n), hoặc n rất lớn (cỡ 10^9).",
      "Tìm giá trị nhỏ nhất / lớn nhất thỏa một điều kiện đơn điệu (nhị phân trên đáp án).",
    ],
    sections: [
      {
        heading: "Bản chất",
        points: [
          "Điều kiện áp dụng: không gian tìm kiếm phải ĐƠN ĐIỆU — nếu vị trí i thỏa điều kiện thì mọi vị trí sau (hoặc trước) cũng thỏa.",
          "Mỗi bước so sánh phần tử giữa với mục tiêu rồi bỏ hẳn một nửa, nên sau k bước chỉ còn n/2^k phần tử, tổng cộng O(log n).",
          "Với n = 1.000.000, tìm tuyến tính cần tới một triệu phép so sánh, nhị phân chỉ cần khoảng 20.",
        ],
      },
      {
        heading: "Nhị phân trên đáp án",
        points: [
          "Nhiều bài không tìm phần tử mà tìm ĐÁP ÁN nhỏ nhất thỏa mãn check(x) == true.",
          "Cần chứng minh check đơn điệu: sai, sai, ..., sai, rồi đúng, đúng, ..., đúng.",
          "Khuôn mẫu: co khoảng [lo, hi] cho tới khi lo == hi, luôn giữ lại nghiệm khả thi.",
        ],
      },
    ],
    template: `// Tìm chỉ số của target, trả -1 nếu không có
int binarySearch(const vector<int>& a, int target) {
    int lo = 0, hi = (int)a.size() - 1;
    while (lo <= hi) {
        int mid = lo + (hi - lo) / 2;   // tránh tràn số
        if (a[mid] == target) return mid;
        if (a[mid] < target) lo = mid + 1;
        else                 hi = mid - 1;
    }
    return -1;
}

// Nhị phân trên đáp án: tìm x nhỏ nhất thỏa check(x)
int lo = 0, hi = LIMIT;
while (lo < hi) {
    int mid = lo + (hi - lo) / 2;
    if (check(mid)) hi = mid;
    else            lo = mid + 1;
}
// lo chính là đáp án`,
    pitfalls: [
      "mid = (lo + hi) / 2 có thể tràn int khi lo, hi lớn — dùng lo + (hi - lo) / 2.",
      "Vòng lặp vô hạn do cập nhật lo = mid thay vì lo = mid + 1.",
      "Áp dụng lên mảng chưa sắp xếp.",
    ],
    demos: [{ slug: "binary_search", label: "Tìm kiếm nhị phân" }],
  },

  {
    id: "linked-list",
    title: "Node & Danh sách liên kết",
    tagline: "Quản lý con trỏ: chèn, xóa, đảo chiều mà không dịch phần tử.",
    icon: "Link2",
    accent: "violet",
    complexity: { time: "O(n)", space: "O(1)" },
    signals: [
      "Đề mô tả các node nối nhau bằng con trỏ next.",
      "Cần chèn / xóa liên tục ở đầu hoặc giữa mà không muốn dịch cả mảng.",
      "Yêu cầu đảo chiều liên kết, tìm phần tử thứ N từ cuối, phát hiện chu trình.",
    ],
    sections: [
      {
        heading: "Bản chất",
        points: [
          "Mỗi node gồm dữ liệu và con trỏ tới node kế tiếp; các node nằm rải rác trong bộ nhớ nên KHÔNG truy cập được theo chỉ số — muốn tới node thứ k phải đi từ head.",
          "Đổi lại, chèn / xóa khi đã có con trỏ tới vị trí chỉ là vài phép gán con trỏ: O(1), không phải dịch dữ liệu như mảng.",
          "Danh sách liên kết đôi thêm con trỏ prev, cho phép duyệt hai chiều và xóa một node khi chỉ biết chính nó.",
        ],
      },
      {
        heading: "Ba kỹ thuật cốt lõi",
        points: [
          "Đảo chiều bằng ba con trỏ prev / curr / next: lưu next TRƯỚC khi cắt liên kết, nếu không sẽ mất toàn bộ phần đuôi.",
          "Hai con trỏ lệch nhau k bước: cho fast đi trước k bước rồi cùng đi — khi fast tới cuối, slow đứng đúng node thứ k từ cuối.",
          "Rùa và thỏ (Floyd): slow đi 1 bước, fast đi 2 bước; nếu gặp nhau thì có chu trình, nếu fast tới NULL thì không.",
        ],
      },
      {
        heading: "Node giả (dummy head)",
        points: [
          "Tạo một node giả đứng trước head giúp việc xóa/chèn ở đầu dùng chung code với các vị trí khác.",
          "Nhờ đó không cần nhánh riêng if (xóa node đầu) — giảm hẳn lỗi biên.",
        ],
      },
    ],
    template: `struct Node {
    int val;
    Node* next;
    Node(int v) : val(v), next(nullptr) {}
};

// Đảo ngược danh sách liên kết đơn
Node* reverse(Node* head) {
    Node* prev = nullptr;
    while (head) {
        Node* nxt = head->next;   // lưu trước khi cắt
        head->next = prev;
        prev = head;
        head = nxt;
    }
    return prev;   // head mới
}

// Xóa node thứ n từ cuối, dùng dummy để xử lý biên
Node* removeNthFromEnd(Node* head, int n) {
    Node dummy(0); dummy.next = head;
    Node *fast = &dummy, *slow = &dummy;
    for (int i = 0; i < n; ++i) fast = fast->next;
    while (fast->next) { fast = fast->next; slow = slow->next; }
    slow->next = slow->next->next;
    return dummy.next;
}`,
    pitfalls: [
      "Cắt head->next trước khi lưu node kế tiếp → mất toàn bộ phần đuôi danh sách.",
      "Truy cập node->next->val mà không kiểm tra node->next != nullptr.",
      "Xóa node mà quên cập nhật head khi node bị xóa chính là head.",
    ],
    demos: [
      { slug: "node01", label: "Khởi tạo & liên kết Node" },
      { slug: "node05", label: "Phát hiện chu trình (rùa & thỏ)" },
      { slug: "ll01", label: "Chèn vào đầu" },
      { slug: "ll03", label: "Xóa node tại vị trí K" },
      { slug: "ll05", label: "Đảo ngược danh sách" },
      { slug: "remove_nth", label: "Xóa node thứ N từ cuối" },
    ],
  },

  {
    id: "stack",
    title: "Stack — LIFO",
    tagline: "Vào sau ra trước: khớp cặp, hoàn tác, biểu thức, đệ quy.",
    icon: "Layers",
    accent: "amber",
    complexity: { time: "O(n)", space: "O(n)" },
    signals: [
      "Đề nói tới dấu ngoặc, thẻ đóng/mở, các cặp phải khớp nhau.",
      "Xử lý biểu thức: trung tố, hậu tố, độ ưu tiên toán tử.",
      "Cần phần tử gần nhất phía trước thỏa điều kiện (monotonic stack).",
      "Mô phỏng undo, hoặc lịch sử duyệt lùi.",
    ],
    sections: [
      {
        heading: "Bản chất",
        points: [
          "Stack chỉ cho thao tác ở một đầu: push, pop, top — tất cả O(1).",
          "Nguyên tắc LIFO khớp tự nhiên với cấu trúc lồng nhau: cái mở sau phải đóng trước.",
          "Đệ quy chính là một stack ngầm do hệ thống quản lý — mọi lời giải đệ quy đều viết lại được bằng stack tường minh.",
        ],
      },
      {
        heading: "Mẫu khớp cặp",
        points: [
          "Gặp ký tự mở thì push. Gặp ký tự đóng: nếu stack rỗng là sai; ngược lại pop và kiểm tra có khớp loại không.",
          "Kết thúc chuỗi, stack phải rỗng — còn phần tử nghĩa là có ngoặc mở chưa đóng.",
        ],
      },
      {
        heading: "Biểu thức hậu tố",
        points: [
          "Chuyển trung tố sang hậu tố (Shunting-yard): số thì ghi ra ngay, toán tử đẩy vào stack theo độ ưu tiên.",
          "Tính hậu tố: gặp số thì push, gặp toán tử thì pop hai toán hạng — chú ý thứ tự, toán hạng pop sau là toán hạng bên trái.",
        ],
      },
    ],
    template: `// Kiểm tra dấu ngoặc hợp lệ
bool isValid(const string& s) {
    stack<char> st;
    unordered_map<char, char> pair_of = {{')','('}, {']','['}, {'}','{'}};
    for (char c : s) {
        if (c == '(' || c == '[' || c == '{') st.push(c);
        else {
            if (st.empty() || st.top() != pair_of[c]) return false;
            st.pop();
        }
    }
    return st.empty();
}

// Tính biểu thức hậu tố
int b = st.top(); st.pop();
int a = st.top(); st.pop();   // a là toán hạng BÊN TRÁI
st.push(apply(a, op, b));`,
    pitfalls: [
      "Gọi st.top() hoặc st.pop() khi stack rỗng → hành vi không xác định, phải kiểm tra empty() trước.",
      "Quên kiểm tra stack rỗng ở cuối bài khớp ngoặc → chuỗi ((( bị coi là hợp lệ.",
      "Đảo thứ tự hai toán hạng khi tính phép trừ hoặc chia trong biểu thức hậu tố.",
    ],
    demos: [
      { slug: "st01", label: "Dấu ngoặc hợp lệ" },
      { slug: "st02", label: "Trung tố sang Hậu tố" },
      { slug: "rpn", label: "Tính biểu thức hậu tố" },
    ],
  },

  {
    id: "queue",
    title: "Queue — FIFO & BFS trên lưới",
    tagline: "Vào trước ra trước: xử lý theo lớp, tìm đường ngắn nhất.",
    icon: "ArrowRightLeft",
    accent: "indigo",
    complexity: { time: "O(V + E)", space: "O(V)" },
    signals: [
      "Đề mô tả hàng đợi, thứ tự phục vụ, xử lý giao dịch tuần tự.",
      "Tìm đường đi NGẮN NHẤT trên lưới hoặc đồ thị không trọng số.",
      "Cần lan tỏa theo từng lớp với số bước tăng dần: loang nước, lây nhiễm, mê cung.",
    ],
    sections: [
      {
        heading: "Bản chất",
        points: [
          "Queue thao tác ở hai đầu: push vào cuối, pop ở đầu — cả hai O(1) với std::queue.",
          "BFS dùng queue nên luôn xử lý hết các đỉnh cách nguồn d bước trước khi sang d+1 bước, do đó lần đầu tới một đỉnh chính là đường ngắn nhất tới đỉnh đó.",
          "Đây là lý do BFS đúng cho đồ thị KHÔNG trọng số (mọi cạnh nặng như nhau); có trọng số phải dùng Dijkstra.",
        ],
      },
      {
        heading: "BFS trên lưới",
        points: [
          "Coi mỗi ô là một đỉnh, hai ô kề nhau (4 hoặc 8 hướng) là một cạnh.",
          "Luôn cần mảng visited, và phải đánh dấu NGAY khi đẩy vào queue, không phải khi lấy ra.",
          "Dùng mảng hướng dx[] / dy[] để code gọn thay vì viết bốn khối if.",
        ],
      },
    ],
    template: `int dx[] = {-1, 1, 0, 0};
int dy[] = {0, 0, -1, 1};

int bfs(vector<vector<char>>& g, pair<int,int> s, pair<int,int> t) {
    int n = g.size(), m = g[0].size();
    vector<vector<int>> dist(n, vector<int>(m, -1));
    queue<pair<int,int>> q;
    q.push(s);
    dist[s.first][s.second] = 0;

    while (!q.empty()) {
        auto [x, y] = q.front(); q.pop();
        if (make_pair(x, y) == t) return dist[x][y];
        for (int k = 0; k < 4; ++k) {
            int nx = x + dx[k], ny = y + dy[k];
            if (nx < 0 || ny < 0 || nx >= n || ny >= m) continue;
            if (g[nx][ny] == '#' || dist[nx][ny] != -1) continue;
            dist[nx][ny] = dist[x][y] + 1;   // đánh dấu khi ĐẨY VÀO
            q.push({nx, ny});
        }
    }
    return -1;   // không tới được
}`,
    pitfalls: [
      "Đánh dấu visited lúc lấy ra khỏi queue → một đỉnh bị đẩy vào nhiều lần, queue phình to, dễ TLE.",
      "Quên kiểm tra biên trước khi truy cập g[nx][ny] → truy cập ngoài mảng.",
      "Dùng BFS cho đồ thị có trọng số khác nhau → đường tìm được không phải ngắn nhất.",
    ],
    demos: [
      { slug: "qu01", label: "Hàng đợi giao dịch (FIFO)" },
      { slug: "qu02", label: "Mê cung — đường ngắn nhất" },
      { slug: "qu03", label: "Sinh số nhị phân bằng Queue" },
    ],
  },

  {
    id: "tree",
    title: "Cây nhị phân & BST",
    tagline: "Chia bài toán cho con trái và con phải, rồi gộp kết quả.",
    icon: "GitBranch",
    accent: "emerald",
    complexity: { time: "O(n)", space: "O(h)" },
    signals: [
      "Đề mô tả node có left và right, hoặc quan hệ cha – con.",
      "Cần duyệt cây, tính chiều cao, đếm nút lá, kiểm tra tính chất của cây.",
      "Cây tìm kiếm nhị phân (BST): mọi node bên trái nhỏ hơn, bên phải lớn hơn.",
    ],
    sections: [
      {
        heading: "Bản chất",
        points: [
          "Cây là đồ thị không chu trình, mỗi node có đúng một cha (trừ gốc) — nhờ vậy đệ quy trên cây không cần mảng visited.",
          "Hầu hết bài cây theo cùng một khuôn: giải cho cây con trái, giải cho cây con phải, rồi gộp lại tại node hiện tại (chia để trị).",
          "Bộ nhớ là O(h) với h là chiều cao, do stack đệ quy — cây suy biến thành chuỗi thì h = n.",
        ],
      },
      {
        heading: "Ba thứ tự duyệt",
        points: [
          "Inorder (trái, node, phải): trên BST cho ra dãy TĂNG DẦN — dùng để kiểm tra BST hợp lệ.",
          "Preorder (node, trái, phải): dùng để sao chép hoặc tuần tự hóa cây.",
          "Postorder (trái, phải, node): dùng khi cần kết quả của con trước, ví dụ tính chiều cao, giải phóng cây.",
        ],
      },
      {
        heading: "Tính chất BST",
        points: [
          "Tìm kiếm trên BST cân bằng là O(log n): so sánh với node hiện tại rồi đi hẳn về một nhánh.",
          "Kiểm tra BST hợp lệ phải truyền khoảng (min, max) xuống dưới, KHÔNG chỉ so sánh node với hai con trực tiếp.",
          "LCA trên BST: đi từ gốc, khi hai giá trị nằm về hai phía của node hiện tại thì đó chính là tổ tiên chung thấp nhất.",
        ],
      },
    ],
    template: `struct TreeNode {
    int val;
    TreeNode *left, *right;
    TreeNode(int v) : val(v), left(nullptr), right(nullptr) {}
};

// Chiều cao — hậu thứ tự
int height(TreeNode* root) {
    if (!root) return 0;
    return 1 + max(height(root->left), height(root->right));
}

// Kiểm tra BST hợp lệ — truyền khoảng cho phép xuống dưới
bool isBST(TreeNode* node, long lo, long hi) {
    if (!node) return true;
    if (node->val <= lo || node->val >= hi) return false;
    return isBST(node->left, lo, node->val)
        && isBST(node->right, node->val, hi);
}
// gọi: isBST(root, LONG_MIN, LONG_MAX)`,
    pitfalls: [
      "Kiểm tra BST bằng cách chỉ so sánh node với left/right → cây sai vẫn được coi là hợp lệ (ví dụ cháu nhỏ hơn ông).",
      "Quên trường hợp cơ sở if (!root) → truy cập con trỏ null.",
      "Đếm nút lá mà tính cả node chỉ có một con — nút lá là node KHÔNG có cả hai con.",
    ],
    demos: [
      { slug: "tree01", label: "Duyệt Inorder" },
      { slug: "tree02", label: "Chiều cao của cây" },
      { slug: "tree03", label: "Kiểm tra BST hợp lệ" },
      { slug: "tree04", label: "Đếm nút lá" },
      { slug: "tree05", label: "Tổ tiên chung thấp nhất (LCA)" },
    ],
  },

  {
    id: "graph",
    title: "Đồ thị — DFS, BFS, Dijkstra",
    tagline: "Mô hình hóa quan hệ thành đỉnh và cạnh, rồi duyệt có kiểm soát.",
    icon: "Network",
    accent: "rose",
    complexity: { time: "O(V + E)", space: "O(V)" },
    signals: [
      "Đề mô tả các đối tượng có kết nối: bạn bè, chuyến bay, phụ thuộc, bản đồ.",
      "Cần kiểm tra liên thông, đếm thành phần liên thông, phát hiện chu trình.",
      "Tìm đường đi ngắn nhất — không trọng số dùng BFS, trọng số dương dùng Dijkstra.",
    ],
    sections: [
      {
        heading: "Biểu diễn đồ thị",
        points: [
          "Danh sách kề vector<vector<int>> adj — nên dùng mặc định, tốn O(V + E) bộ nhớ.",
          "Ma trận kề bool a[V][V] — chỉ nên dùng khi V nhỏ hoặc đồ thị dày, tốn O(V^2).",
          "Đồ thị vô hướng phải thêm cạnh theo cả hai chiều khi đọc dữ liệu.",
        ],
      },
      {
        heading: "Chọn thuật toán duyệt",
        points: [
          "DFS đi sâu hết một nhánh mới quay lại — phù hợp đếm thành phần liên thông, phát hiện chu trình, sắp xếp topo.",
          "BFS lan theo từng lớp — cho đường đi ít cạnh nhất trên đồ thị không trọng số.",
          "Dijkstra là BFS có ưu tiên: dùng priority_queue để luôn mở rộng đỉnh có khoảng cách tạm nhỏ nhất; chỉ đúng khi mọi trọng số không âm.",
        ],
      },
      {
        heading: "Dijkstra vận hành",
        points: [
          "Giữ mảng dist là khoảng cách tốt nhất đã biết, khởi tạo vô cực trừ đỉnh nguồn.",
          "Lấy đỉnh gần nhất ra khỏi heap, rồi nới lỏng (relax) từng cạnh: nếu dist[u] + w < dist[v] thì cập nhật và đẩy v vào heap.",
          "Khi một đỉnh được lấy ra khỏi heap lần đầu, khoảng cách của nó đã tối ưu — các bản ghi cũ còn lại thì bỏ qua.",
        ],
      },
    ],
    template: `// DFS đệ quy
void dfs(int u, vector<vector<int>>& adj, vector<bool>& vis) {
    vis[u] = true;
    for (int v : adj[u])
        if (!vis[v]) dfs(v, adj, vis);
}

// Dijkstra với priority_queue (min-heap)
vector<long long> dijkstra(int s, int n, vector<vector<pair<int,int>>>& adj) {
    const long long INF = 1e18;
    vector<long long> dist(n, INF);
    priority_queue<pair<long long,int>,
                   vector<pair<long long,int>>,
                   greater<>> pq;
    dist[s] = 0;
    pq.push({0, s});

    while (!pq.empty()) {
        auto [d, u] = pq.top(); pq.pop();
        if (d > dist[u]) continue;           // bản ghi cũ, bỏ qua
        for (auto [v, w] : adj[u]) {
            if (dist[u] + w < dist[v]) {
                dist[v] = dist[u] + w;
                pq.push({dist[v], v});
            }
        }
    }
    return dist;
}`,
    pitfalls: [
      "Quên mảng visited → DFS/BFS lặp vô hạn trên đồ thị có chu trình.",
      "Dùng Dijkstra khi có cạnh trọng số âm → kết quả sai, phải dùng Bellman-Ford.",
      "DFS đệ quy quá sâu khi V lớn gây tràn stack — chuyển sang DFS dùng stack tường minh.",
    ],
    demos: [
      { slug: "graph01", label: "BFS — duyệt theo chiều rộng" },
      { slug: "graph02", label: "DFS — duyệt theo chiều sâu" },
      { slug: "graph03", label: "Dijkstra — đường đi ngắn nhất" },
    ],
  },

  {
    id: "dp",
    title: "Quy hoạch động (DP)",
    tagline: "Định nghĩa trạng thái, viết công thức truy hồi, lưu lại để dùng lại.",
    icon: "Table2",
    accent: "violet",
    complexity: { time: "O(n·m)", space: "O(n·m)" },
    signals: [
      "Đề hỏi số cách, giá trị lớn nhất hoặc nhỏ nhất, và các lựa chọn phụ thuộc nhau.",
      "Lời giải vét cạn có các bài toán con LẶP LẠI nhiều lần.",
      "Có cấu trúc chọn hoặc không chọn từng phần tử (cái túi, chuỗi con).",
    ],
    sections: [
      {
        heading: "Hai điều kiện cần",
        points: [
          "Bài toán con gối nhau: cùng một bài toán con được giải nhiều lần, nên lưu lại có lợi.",
          "Cấu trúc con tối ưu: nghiệm tối ưu của bài lớn ghép được từ nghiệm tối ưu của các bài con.",
        ],
      },
      {
        heading: "Quy trình bốn bước",
        points: [
          "1. Định nghĩa trạng thái: dp[i][j] NGHĨA LÀ GÌ — viết thành câu đầy đủ trước khi code.",
          "2. Công thức truy hồi: dp[i][j] được tính từ những trạng thái nào?",
          "3. Trường hợp cơ sở: giá trị khởi tạo ở biên (thường là i = 0 hoặc j = 0).",
          "4. Thứ tự tính: đảm bảo mọi trạng thái phụ thuộc đã được tính trước.",
        ],
      },
      {
        heading: "Ba dạng kinh điển",
        points: [
          "Leo cầu thang / Fibonacci: dp[i] = dp[i-1] + dp[i-2] — DP một chiều, nén được về hai biến.",
          "Cái túi 0/1: dp[i][w] = max(dp[i-1][w], dp[i-1][w - wt[i]] + val[i]) — chọn hoặc không chọn vật i.",
          "LCS: khớp thì dp[i][j] = dp[i-1][j-1] + 1, không khớp thì max(dp[i-1][j], dp[i][j-1]).",
        ],
      },
      {
        heading: "Tối ưu bộ nhớ",
        points: [
          "Nếu dp[i] chỉ phụ thuộc dp[i-1], có thể chỉ giữ hai hàng, hoặc một hàng và duyệt ngược (cái túi 0/1).",
          "Đây là bước tối ưu SAU khi bảng hai chiều đã chạy đúng — đừng nén ngay từ đầu.",
        ],
      },
    ],
    template: `// Cái túi 0/1 — bảng hai chiều
int knapsack(vector<int>& wt, vector<int>& val, int W) {
    int n = wt.size();
    vector<vector<int>> dp(n + 1, vector<int>(W + 1, 0));
    for (int i = 1; i <= n; ++i)
        for (int w = 0; w <= W; ++w) {
            dp[i][w] = dp[i - 1][w];                    // không chọn vật i
            if (w >= wt[i - 1])                         // chọn vật i
                dp[i][w] = max(dp[i][w],
                               dp[i - 1][w - wt[i - 1]] + val[i - 1]);
        }
    return dp[n][W];
}

// LCS — chuỗi con chung dài nhất
if (a[i - 1] == b[j - 1]) dp[i][j] = dp[i - 1][j - 1] + 1;
else                      dp[i][j] = max(dp[i - 1][j], dp[i][j - 1]);`,
    pitfalls: [
      "Lệch chỉ số giữa bảng dp (1-based) và mảng dữ liệu (0-based) — luôn viết rõ wt[i - 1].",
      "Duyệt xuôi khi nén cái túi 0/1 về một hàng → một vật bị dùng nhiều lần, thành bài túi vô hạn.",
      "Không khởi tạo trường hợp cơ sở, hoặc khởi tạo 0 trong bài tìm giá trị nhỏ nhất (phải là vô cực).",
    ],
    demos: [
      { slug: "climbing", label: "Leo cầu thang" },
      { slug: "dp01", label: "Cái túi 0/1 (Knapsack)" },
      { slug: "dp02", label: "Chuỗi con chung dài nhất (LCS)" },
    ],
  },
];
