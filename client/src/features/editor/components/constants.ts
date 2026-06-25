export const INITIAL_CODE: Record<string, string> = {
  javascript: `// Dữ liệu đầu vào: Danh sách sản phẩm trong giỏ hàng
const products = [
  { id: 1, name: "Bàn phím cơ", price: 100 },
  { id: 2, name: "Chuột Gaming", price: 50 }
];

function apDungKhuyenMai(products) {
  // Thực hiện: Sử dụng phương thức .map() để nhân đôi giá (price) của từng sản phẩm
  // Viết code của bạn ở đây:
  
}`,
  python: `# Dữ liệu đầu vào: Danh sách sản phẩm trong giỏ hàng
products = [
    {"id": 1, "name": "Bàn phím cơ", "price": 100},
    {"id": 2, "name": "Chuột Gaming", "price": 50}
]

def ap_dung_khuyen_mai(products):
    # Thực hiện: Sử dụng List Comprehension hoặc map() để nhân đôi giá (price)
    # Viết code của bạn ở đây:
    pass`,
  cpp: `#include <iostream>
#include <vector>
#include <string>

struct Product {
    int id;
    std::string name;
    int price;
};

// Dữ liệu đầu vào
std::vector<Product> products = {
    {1, "Bàn phím cơ", 100},
    {2, "Chuột Gaming", 50}
};

std::vector<Product> apDungKhuyenMai(std::vector<Product> products) {
    // Thực hiện: Duyệt qua vector và nhân đôi giá (price) của từng Product
    // Viết code của bạn ở đây:
    
}`,
  java: `import java.util.ArrayList;
import java.util.List;

class Product {
    int id;
    String name;
    int price;
    
    Product(int id, String name, int price) {
        this.id = id;
        this.name = name;
        this.price = price;
    }
}

class Solution {
    public List<Product> apDungKhuyenMai(List<Product> products) {
        // Thực hiện: Sử dụng Stream API (.map()) hoặc vòng lặp để nhân đôi giá (price)
        // Viết code của bạn ở đây:
        
        return products;
    }
}`,
};
