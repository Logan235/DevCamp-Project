

export const lessons = {
  "1": {
    title: "Khai báo mảng cơ bản",
      description: `
Mảng (Array) là cấu trúc dữ liệu dùng để lưu nhiều phần tử cùng kiểu dữ liệu.

Trong C++, các phần tử được lưu liên tiếp trong bộ nhớ.

Ví dụ:
int a[5] = {1,2,3,4,5};

Phần tử đầu tiên có chỉ số 0.
Phần tử cuối cùng có chỉ số n-1.
`,

    syntax: `int a[5];

int b[5] = {1,2,3,4,5};
`,
    example: `#include <iostream>
using namespace std;

int main() {
    int a[3] = {10,20,30};

    cout << a[0] << endl;
    cout << a[1] << endl;
    cout << a[2] << endl;
}
`
  },

  "2": {
    title: "Thêm/Xóa phần tử",
    description: `
Trong C++, mảng thông thường có kích thước cố định nên việc thêm hoặc xóa phần tử rất khó.

Vì vậy ta thường sử dụng vector.

Các hàm phổ biến:

• push_back() : thêm phần tử vào cuối.

• pop_back() : xóa phần tử cuối.

• insert() : chèn phần tử vào vị trí bất kỳ.

• erase() : xóa phần tử tại vị trí bất kỳ.
`,
syntax: `
vector<int> nums;

nums.push_back(10);

nums.pop_back();

nums.insert(nums.begin() + 1, 20);

nums.erase(nums.begin() + 1);
`,
 example: `
#include <iostream>
#include <vector>

using namespace std;

int main() {

    vector<int> nums;

    nums.push_back(1);
    nums.push_back(2);
    nums.push_back(3);

    nums.pop_back();

    for(int x : nums)
        cout << x << " ";

    // Output: 1 2
}
`
  },

  "3": {
    title: "Lọc phần tử trong mảng",
    description:`Cho một mảng số nguyên.

Nhiệm vụ lọc mảng là duyệt qua từng phần tử và chỉ giữ lại
những phần tử thỏa mãn điều kiện.

Ví dụ:
- Lọc số chẵn
- Lọc số lớn hơn 10
- Lọc số âm

Trong C++, ta thường dùng vòng lặp for kết hợp câu lệnh if.`
      ,
    syntax: `for(int x : arr)
{
    if(condition)
    {
        // xử lý phần tử
    }
}`,
    example: `#include <iostream>
#include <vector>

using namespace std;

int main()
{
    vector<int> nums = {1,2,3,4,5,6};

    for(int x : nums)
    {
        if(x % 2 == 0)
        {
            cout << x << " ";
        }
    }

    // Output: 2 4 6
}`,
  },

  "4": {
    title: "Hàm map()",
    description:
      `map là cấu trúc dữ liệu lưu trữ dữ liệu theo cặp:

(key, value)

Mỗi key là duy nhất.

map tự động sắp xếp các phần tử theo key tăng dần.`,
    syntax: `#include <map>
map<string, int> score;`,
    example: `#include <iostream>
#include <map>

using namespace std;

int main()
{
    map<string, int> score;

    score["An"] = 9;
    score["Binh"] = 8;

    cout << score["An"];
}`,
  },
};