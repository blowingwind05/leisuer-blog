---
title: C++复健笔记 Vol.3：vector 和 string
description: 复习机考里最常用的两个 STL 类型：动态数组 vector 和字符串 string。
created: 2026-05-28
category: [Notes, C++复健笔记]
tags:
  - C++
  - STL
  - 学习笔记
cover: https://pic1.imgdb.cn/item/6a17b9a5cf68566346154aa3.png
draft: false
---

C 语言里写数组和字符串，总要操心长度、边界和结尾的 `\0`。C++ 里有 `vector` 和 `string`，很多时候会舒服不少。当然，舒服不代表不用脑子，尤其是下标、迭代器失效、输入整行字符串这些地方，还是很容易写出一些自信但错误的代码。

## vector：动态数组

`vector` 可以理解成长度可变的数组。

```cpp
#include <iostream>
#include <vector>
using namespace std;

int main() {
    vector<int> a;

    a.push_back(10);
    a.push_back(20);
    a.push_back(30);

    cout << a.size() << '\n';
    cout << a[0] << ' ' << a[1] << ' ' << a[2] << '\n';

    return 0;
}
```

常用操作先列一下：

- `vector<int> a;`：空 vector。
- `vector<int> a(n);`：长度为 `n`，元素默认初始化。
- `vector<int> a(n, x);`：长度为 `n`，每个元素初始化为 `x`。
- `a.size()`：元素个数。
- `a.empty()`：是否为空。
- `a.push_back(x)`：末尾加入元素。
- `a.pop_back()`：删除末尾元素。
- `a.back()`：最后一个元素。
- `a.clear()`：清空。

读入 `n` 个数时，最常见写法：

```cpp
int n;
cin >> n;

vector<int> a(n);
for (int i = 0; i < n; i++) {
    cin >> a[i];
}
```

如果不知道数量，或者边读边加：

```cpp
vector<int> a;
int x;

while (cin >> x) {
    a.push_back(x);
}
```

## 遍历 vector

需要下标时，用普通 for：

```cpp
for (int i = 0; i < (int)a.size(); i++) {
    cout << i << ": " << a[i] << '\n';
}
```

不需要下标时，用范围 for：

```cpp
for (int x : a) {
    cout << x << '\n';
}
```

需要修改元素时，用引用：

```cpp
for (int& x : a) {
    x *= 2;
}
```

大对象只读时，用 `const` 引用：

```cpp
for (const string& s : names) {
    cout << s << '\n';
}
```

这里有一个小习惯：`a.size()` 的类型是 `size_t`，是无符号整数。机考里为了少和 signed / unsigned warning 纠缠，我通常会写：

```cpp
for (int i = 0; i < (int)a.size(); i++) {
}
```

或者干脆提前存下来：

```cpp
int n = a.size();
for (int i = 0; i < n; i++) {
}
```

## 排序和查找

排序需要 `<algorithm>`。

```cpp
#include <algorithm>
```

升序：

```cpp
sort(a.begin(), a.end());
```

降序：

```cpp
sort(a.begin(), a.end(), greater<int>());
```

自定义排序：

```cpp
vector<pair<int, int>> a = {{1, 3}, {1, 2}, {2, 1}};

sort(a.begin(), a.end(), [](const auto& x, const auto& y) {
    if (x.first != y.first) return x.first < y.first;
    return x.second > y.second;
});
```

这里 lambda 的意思是：先按第一维升序，第一维相同再按第二维降序。

查找某个值：

```cpp
auto it = find(a.begin(), a.end(), x);

if (it != a.end()) {
    cout << "found" << '\n';
}
```

如果 vector 已经有序，可以二分：

```cpp
bool ok = binary_search(a.begin(), a.end(), x);
```

找第一个大于等于 `x` 的位置：

```cpp
auto it = lower_bound(a.begin(), a.end(), x);
int pos = it - a.begin();
```

这部分后面二分专题再细写，现在先恢复 API。

## 二维 vector

二维数组可以用二维 `vector`：

```cpp
int n, m;
cin >> n >> m;

vector<vector<int>> grid(n, vector<int>(m));

for (int i = 0; i < n; i++) {
    for (int j = 0; j < m; j++) {
        cin >> grid[i][j];
    }
}
```

初始化为某个值：

```cpp
vector<vector<int>> dist(n, vector<int>(m, -1));
```

方向数组也很常见：

```cpp
int dx[4] = {1, -1, 0, 0};
int dy[4] = {0, 0, 1, -1};

for (int k = 0; k < 4; k++) {
    int nx = x + dx[k];
    int ny = y + dy[k];
}
```

二维 `vector` 写起来方便，但每一行本质上是单独的 `vector`，不是一整块连续的二维数组。一般机考不太需要关心这个，知道即可。

## vector 的几个坑

第一，`[]` 不检查越界。

```cpp
vector<int> a(3);
cout << a[10] << '\n'; // UB
```

如果想检查越界，可以用：

```cpp
a.at(10)
```

第二，空 vector 不能直接 `back()` 或 `pop_back()`。

```cpp
if (!a.empty()) {
    a.pop_back();
}
```

第三，遍历时修改 vector 大小要小心。

```cpp
for (int i = 0; i < (int)a.size(); i++) {
    if (a[i] == 0) {
        a.push_back(1);
    }
}
```

这种代码可能导致循环范围不断变化。不是一定错，但要明确自己在干什么。

## string：更好用的字符数组

`string` 是 C++ 里的字符串类型。

```cpp
#include <iostream>
#include <string>
using namespace std;

int main() {
    string s = "hello";

    cout << s.size() << '\n';
    cout << s[0] << '\n';

    return 0;
}
```

常用操作：

- `s.size()`：长度。
- `s.empty()`：是否为空。
- `s[i]`：第 `i` 个字符。
- `s.push_back(c)`：末尾加字符。
- `s += t`：拼接字符串。
- `s.substr(pos, len)`：截取子串。
- `s.find(t)`：查找子串。

例子：

```cpp
string s = "abcdef";

cout << s.substr(2, 3) << '\n'; // cde
cout << s.find("cd") << '\n';   // 2
```

`find` 找不到时会返回 `string::npos`：

```cpp
if (s.find("xy") == string::npos) {
    cout << "not found" << '\n';
}
```

## cin 和 getline

`cin >> s` 会读到空白字符为止：

```cpp
string s;
cin >> s;
```

输入：

```txt
hello world
```

这里只会读到 `hello`。

如果要读整行，用 `getline`：

```cpp
string line;
getline(cin, line);
```

但如果前面刚用过 `cin >> n`，换行符还留在输入缓冲区里，直接 `getline` 可能读到空行。

```cpp
int n;
cin >> n;

string line;
getline(cin, line); // 可能读到上一行剩下的换行
```

常用处理：

```cpp
int n;
cin >> n;
cin.ignore();

string line;
getline(cin, line);
```

如果要更稳一点，可以写：

```cpp
#include <limits>
cin.ignore(numeric_limits<streamsize>::max(), '\n');
```

## 字符串遍历和修改

遍历字符：

```cpp
for (char c : s) {
    cout << c << '\n';
}
```

修改字符：

```cpp
for (char& c : s) {
    if ('a' <= c && c <= 'z') {
        c = c - 'a' + 'A';
    }
}
```

也可以用 `<cctype>`：

```cpp
#include <cctype>

for (char& c : s) {
    c = toupper(c);
}
```

注意 `toupper` 返回的是 `int`，赋回 `char` 一般没问题，但要知道它不是直接返回 `char`。

## 小练习：统计单词长度

写一个简单练习：读入一整行，按空格切分，输出每个单词的长度。

```cpp
#include <iostream>
#include <sstream>
#include <string>
#include <vector>
using namespace std;

int main() {
    string line;
    getline(cin, line);

    stringstream ss(line);
    string word;
    vector<int> lengths;

    while (ss >> word) {
        lengths.push_back(word.size());
    }

    for (int x : lengths) {
        cout << x << ' ';
    }
    cout << '\n';

    return 0;
}
```

这里顺手用到了 `stringstream`，它可以把一个字符串当成输入流来读。以后处理“一行里有多个元素”的输入时会很方便。

## 小结

- `vector`：动态数组，重点是初始化、遍历、排序、二维写法和边界。
- `string`：字符串，重点是 `cin` / `getline`、子串、查找和逐字符处理。
- 范围 for 默认拷贝，需要修改时写引用。
- 大对象只读时用 `const T&`。
- `sort`、`find`、`lower_bound` 这些 API 要写熟。

下一篇继续补几个常用 STL 容器：`stack`、`queue`、`deque`、`set`、`map`、`priority_queue`。
