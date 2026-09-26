// Kiểu dữ liệu dùng chung cho toàn bộ hệ thống trực quan hóa thuật toán.
// Mỗi bài toán được mô tả bằng một danh sách "bước" (step); mỗi bước chỉ cần
// khai báo những khung hình mà nó muốn hiển thị (mảng, danh sách liên kết, cây,
// đồ thị, stack, queue, bảng DP, bảng băm...). VisualizerBox sẽ tự render
// những khung nào có dữ liệu.

export type NodeState =
  | "idle"
  | "active"
  | "found"
  | "visited"
  | "muted"
  | "danger";

export type CellView = {
  value: string | number;
  state?: NodeState;
  badge?: string;
};

export type ListCellView = {
  value: string | number;
  /** Khóa ổn định giữa các bước để framer-motion animate đúng node khi hoán vị. */
  id?: string;
  state?: NodeState;
  badges?: string[];
};

export type ListView = {
  nodes: ListCellView[];
  /** Node vừa được cấp phát nhưng chưa nối vào chuỗi. */
  pending?: ListCellView | null;
  /** Nhãn cho node rời. Mặc định: "Node mới (chưa liên kết)". */
  pendingLabel?: string;
  /** Danh sách liên kết đôi: vẽ mũi tên hai chiều. */
  doubly?: boolean;
  /** N node đầu tiên đã bị đảo chiều liên kết (dùng cho bài reverse). */
  reversedCount?: number;
  /** Node cuối trỏ vòng về node ở chỉ số này (dùng cho bài phát hiện chu trình). */
  cycleTo?: number | null;
  /** Hiển thị ô NULL ở cuối chuỗi. Mặc định: true. */
  tailNull?: boolean;
  label?: string;
};

export type TreeNodeView = {
  value: string | number;
  state?: NodeState;
  badge?: string;
  left?: TreeNodeView | null;
  right?: TreeNodeView | null;
};

export type GraphNodeView = {
  id: string;
  /** Toạ độ theo phần trăm khung vẽ (0 - 100). */
  x: number;
  y: number;
  state?: NodeState;
  badge?: string;
};

export type GraphEdgeView = {
  from: string;
  to: string;
  weight?: number;
  state?: NodeState;
};

export type GraphView = {
  nodes: GraphNodeView[];
  edges: GraphEdgeView[];
  directed?: boolean;
};

export type GridView = {
  cells: (string | number)[][];
  rowLabels?: string[];
  colLabels?: string[];
  active?: [number, number][];
  found?: [number, number][];
  visited?: [number, number][];
  /** Giá trị được coi là ô tường/chướng ngại vật. Mặc định: "#". */
  wallValue?: string;
  caption?: string;
};

export type MapEntryView = {
  key: string | number;
  value: string | number;
  state?: NodeState;
};

export type VisualizerStep = {
  /** Lời giải thích cho bước hiện tại (hiển thị ở panel bên phải). */
  description: string;

  // --- Mảng tuyến tính ---
  array?: (string | number)[];
  pointers?: Record<string, number>;
  activeIndices?: number[];
  foundIndices?: number[];
  visitedIndices?: number[];
  mutedIndices?: number[];
  arrayLabel?: string;

  // --- Các cấu trúc dữ liệu khác ---
  list?: ListView;
  tree?: TreeNodeView | null;
  treeLabel?: string;
  graph?: GraphView;
  grid?: GridView;
  stack?: CellView[];
  stackLabel?: string;
  queue?: CellView[];
  queueLabel?: string;
  map?: MapEntryView[];
  mapLabel?: string;

  // --- Trạng thái phụ ---
  output?: string;
  outputLabel?: string;
  variables?: Record<string, string | number | boolean>;
  codeLine?: number;
};

export type VisualizerData = {
  title: string;
  steps: VisualizerStep[];
  codeSnippet?: string[];
};

// --- Helper ngắn gọn để viết dữ liệu ---

/** Tạo một ô cho stack/queue. */
export const cell = (
  value: string | number,
  state?: NodeState,
  badge?: string,
): CellView => ({ value, state, badge });

/** Tạo một node cho danh sách liên kết. */
export const ln = (
  value: string | number,
  state?: NodeState,
  badges?: string[],
): ListCellView => ({ value, id: String(value), state, badges });
