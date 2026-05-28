---
title: C++复健笔记 Vol.1：重新开始手写代码
description: AI很好用，但机考不会替我敲键盘。这个系列用来记录我在夏令营机考前重新找回C++手感的过程。
created: 2026-05-28
category: [Notes, C++复健笔记]
cover: https://pic1.imgdb.cn/item/6a17b9a5cf68566346154aa3.png
tags:
  - C++
  - 算法
  - 机考
  - 学习笔记
draft: false
---

## 前言

由于现在 AI 发展迅速（AI 太好用了你们知道吗），我已经很少手写代码了。再加上大学程序设计课程学的是 C 语言，我现在可能实际上不怎么能手写 C++ 代码。

然而夏令营机考将至，本人不得不复习一下如何写 C++ 代码。~~程序员一定要会写程序。~~

所以，我打算写一系列文章，记录一下我复健的过程。

## 这个系列打算写什么

这个系列不是系统的 C++ 教程，也不是算法竞赛从入门到入土。它就只是一份复健日志：记录我从“知道应该怎么写”重新回到“手能自然写出来”的过程。

我希望每篇文章都解决一个很小的问题，比如：

- 常用输入输出和模板怎么写；
- `vector`、`string`、`map`、`set` 这些 STL 容器怎么快速上手；
- 排序、二分、前缀和、双指针这些常见套路怎么写；
- BFS、DFS、最短路、并查集这些基础算法怎么恢复肌肉记忆；
- 机考时怎样减少低级错误。

目标不是写出多么优雅的工程代码，而是在有限时间里写出正确、清楚、能通过样例和测试点的程序。

## 第一件事：你好，世界

我知道你很急，但是你先别急。就像是学编程语言第一件事是写“Hello, World!”一样，复健当然也可以从这里开始。

```cpp
#include <iostream>
using namespace std;

int main() {
    cout << "Hello, World!" << endl;
    return 0;
}
```

不过机考时，可以用下面这个版本：

```cpp
#include <bits/stdc++.h>
using namespace std;

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    cout << "Hello, World!" << endl;
    return 0;
}
```

`#include <bits/stdc++.h>` 是算法题里常见的“全家桶”头文件，能省掉很多按需引入标准库的时间；`ios::sync_with_stdio(false);` 和 `cin.tie(nullptr);` 用来加速输入输出。我在练习时尽量不用这个写法，以免忘记需要 `#include` 什么头文件。

## 顺手写一个小题

为了让手动起来，先写一个最普通的问题：读入 `n` 个整数，输出它们的和、最大值和最小值。

```cpp
#include <iostream>
#include <vector>
using namespace std;

int main(){
    int n;
    cin >> n;
    vector<int> arr(n);
    for(int i = 0; i < n; i++){
        cin >> arr[i];
    }
    long long sum = 0;
    int min = arr[0];
    int max = arr[0];
    for(int i = 0; i < n; i++){
        sum += arr[i];
        if(arr[i] < min){
            min = arr[i];
        }
        if(arr[i] > max){
            max = arr[i];
        }
    }
    cout << "Sum: " << sum << '\n';
    cout << "Min: " << min << '\n';
    cout << "Max: " << max << '\n';
    return 0;
}
```

这题本身当然不难，但它可以提醒我几件事：

- 求和最好用 `long long`，避免整数范围不够。
- 初始化最大值和最小值时，可以直接用第一个元素。
- 输出换行用 `'\n'`，不要在大量输出里滥用 `endl`。
- 能用范围 for 的时候，代码会清爽很多。

## 下一步

下一篇大概会从熟悉指针和引用开始。

希望这个系列写到后面，我能真正摆脱AI大人的喂饭，学会自己走路。加油！
