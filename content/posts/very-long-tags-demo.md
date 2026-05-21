---
title: 超长标签截断测试
description: 这篇文章专门用于测试标签名称很长时，文章卡片底部的单行截断、加号计数和展开交互。
created: 2026-05-16
updated: 2026-05-16
category: Test
tags:
  - SuperLongFrontendExperimentTag
  - 一个非常非常长的中文标签名字
  - NuxtContentRenderingPipeline
  - ResponsiveLayoutBoundaryCase
  - UI
  - Hover
cover: /img/cover/18.webp
draft: false
---

这是一篇用于测试超长标签的占位文章。

当标签本身很长时，组件应该尽量显示能放下的内容，并把剩余标签折叠成 `+N`。展开后可以观察卡片固定高度下的溢出表现。
