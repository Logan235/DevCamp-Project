import type { VisualizerData } from "./types";
import { arrFrequency, arrKadane, arrMinMax, arrReverse, arrRotate } from "./data/arrays";
import {
  llDeleteAtK,
  llInsertHead,
  llInsertTail,
  llReverse,
  llSearch,
} from "./data/linkedList";
import {
  treeCountLeaves,
  treeHeight,
  treeInorder,
  treeLca,
  treeValidateBst,
} from "./data/trees";
import {
  nodeCreateLink,
  nodeDetectCycle,
  nodeDoubly,
  nodeFilterEven,
  nodeFindTail,
} from "./data/nodes";
import { dpClimbingStairs, dpKnapsack, dpLcs } from "./data/dp";
import { graphBfs, graphDfs, graphDijkstra } from "./data/graphs";
import {
  stackEvalRpn,
  stackInfixToPostfix,
  stackValidParentheses,
} from "./data/stacks";
import { queueBinaryNumbers, queueMaze, queueTransactions } from "./data/queues";
import {
  binarySearch,
  groupAnagrams,
  helloWorld,
  makeFallback,
  removeNthFromEnd,
  threeSum,
  twoSum,
} from "./data/classics";

/**
 * Tra theo mã bài trong slug (arr01, ll03, tree05, graph02...). Đây là cách
 * khớp chính xác nhất vì slug được sinh tự động từ tên bài nên phần mã đứng đầu
 * luôn ổn định, không bị ảnh hưởng bởi việc bỏ dấu tiếng Việt.
 */
const BY_CODE: Record<string, VisualizerData> = {
  arr01: arrMinMax,
  arr02: arrReverse,
  arr03: arrFrequency,
  arr04: arrRotate,
  arr05: arrKadane,

  ll01: llInsertHead,
  ll02: llInsertTail,
  ll03: llDeleteAtK,
  ll04: llSearch,
  ll05: llReverse,

  tree01: treeInorder,
  tree02: treeHeight,
  tree03: treeValidateBst,
  tree04: treeCountLeaves,
  tree05: treeLca,

  node01: nodeCreateLink,
  node02: nodeFindTail,
  node03: nodeFilterEven,
  node04: nodeDoubly,
  node05: nodeDetectCycle,

  dp01: dpKnapsack,
  dp02: dpLcs,

  graph01: graphBfs,
  graph02: graphDfs,
  graph03: graphDijkstra,

  st01: stackValidParentheses,
  st02: stackInfixToPostfix,

  qu01: queueTransactions,
  qu02: queueMaze,
  qu03: queueBinaryNumbers,
};

/**
 * Lớp dự phòng: khớp theo từ khóa cho những bài không có mã ở đầu slug
 * (Two Sum, 3Sum, Climbing Stairs...) và cho các bài được thêm về sau.
 * Thứ tự trong danh sách là thứ tự ưu tiên — luật cụ thể đặt trước luật chung.
 */
const BY_KEYWORD: { data: VisualizerData; keys: string[] }[] = [
  { data: helloWorld, keys: ["hello_world", "hello world", "helloworld"] },
  { data: twoSum, keys: ["two_sum", "two sum", "twosum", "tong_hai_so"] },
  { data: threeSum, keys: ["3sum", "three_sum", "three sum", "bo_ba"] },
  { data: groupAnagrams, keys: ["anagram", "nhom_chuoi", "chuoi_ao_chu"] },
  { data: stackEvalRpn, keys: ["polish", "rpn", "hau_to"] },
  { data: removeNthFromEnd, keys: ["remove_nth", "nth_node", "nth node"] },
  { data: dpClimbingStairs, keys: ["climbing", "climb_stairs", "cau_thang"] },
  {
    data: binarySearch,
    keys: ["binary_search", "binary search", "tim_kiem_nhi_phan", "binarysearch"],
  },
  { data: dpKnapsack, keys: ["knapsack", "cai_tui", "caitui"] },
  { data: dpLcs, keys: ["lcs", "chuoi_con_chung", "common_subsequence"] },
  { data: graphDijkstra, keys: ["dijkstra"] },
  { data: graphBfs, keys: ["bfs", "breadth", "chieu_rong"] },
  { data: graphDfs, keys: ["dfs", "depth_first", "chieu_sau"] },
  { data: queueMaze, keys: ["me_cung", "maze", "matran_queue"] },
  { data: stackValidParentheses, keys: ["dau_ngoac", "parenthes", "bracket"] },
  { data: stackInfixToPostfix, keys: ["infix", "postfix", "trung_to"] },
  { data: nodeDetectCycle, keys: ["cycle", "chu_trinh", "vong_lap_node"] },
  { data: llReverse, keys: ["reverse_linkage", "reverse_linked", "lien_ket_on"] },
  { data: treeInorder, keys: ["inorder", "thu_tu_giua"] },
  { data: treeValidateBst, keys: ["validate_bst", "validatebst", "hop_le_cua_cay"] },
  { data: treeCountLeaves, keys: ["nut_la", "leaf", "leaves"] },
  { data: treeLca, keys: ["lca", "to_tien_chung", "common_ancestor"] },
  { data: treeHeight, keys: ["chieu_cao", "max_depth", "height_of_tree"] },
  { data: arrFrequency, keys: ["tan_suat", "frequency", "most_frequent"] },
  { data: arrKadane, keys: ["kadane", "mang_con_lien_tiep", "maximum_subarray"] },
  { data: arrRotate, keys: ["xoay_vong", "rotate"] },
  { data: arrReverse, keys: ["nguoc_mang", "reverse_array", "reverse array"] },
  { data: llSearch, keys: ["vi_tri_xuat_hien", "tim_kiem_vi_tri"] },
  { data: llInsertHead, keys: ["insert_head", "insert head", "chen_phan_tu_vao_au"] },
  { data: llInsertTail, keys: ["insert_tail", "insert tail", "chen_phan_tu_vao_cuoi"] },
  { data: nodeDoubly, keys: ["doubly", "node_oi", "node_doi"] },
  { data: queueTransactions, keys: ["hang_oi", "hang_doi", "queue"] },
  { data: arrMinMax, keys: ["lon_nhat_va_nho_nhat", "min_max", "minmax"] },
];

/** Bỏ dấu tiếng Việt và chuẩn hóa về dạng chỉ gồm chữ, số và dấu gạch dưới. */
function normalize(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9]+/g, "_");
}

/** Lấy mã bài ở đầu slug, ví dụ "arr01_-_tim_so..." → "arr01". */
function extractCode(slug: string): string | null {
  const match = slug.toLowerCase().match(/^([a-z]+)0*(\d+)/);
  if (!match) return null;
  return `${match[1]}${match[2].padStart(2, "0")}`;
}

/**
 * Chọn bộ dữ liệu trực quan hóa phù hợp nhất cho một bài tập.
 * Ưu tiên: mã bài trong slug → từ khóa trong slug/tiêu đề → mô phỏng mặc định.
 */
export function resolveVisualizer(slug: string, title: string): VisualizerData {
  const code = extractCode(slug ?? "");
  if (code && BY_CODE[code]) return BY_CODE[code];

  const haystack = `${normalize(slug ?? "")}_${normalize(title ?? "")}`;
  for (const rule of BY_KEYWORD) {
    if (rule.keys.some((key) => haystack.includes(normalize(key)))) {
      return rule.data;
    }
  }

  return makeFallback(title);
}
