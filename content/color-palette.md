---
title: 站点色彩方案
description: Leisuer 博客当前使用的亮色、暗色与公用颜色整理。
created: 2026-05-16
updated: 2026-05-16
category: Design
tags:
  - Color
  - Theme
  - CSS
  - Design System
draft: false
---

# 站点色彩方案

这篇文章整理了当前站点正在使用的颜色方案，按明亮模式、黑暗模式和公用颜色三类展示，便于后续统一主题、重构样式或补设计文档。

## 明亮模式

| 标识符 | 色号 |
| --- | --- |
| `--color-bg` | `#eef7ff` |
| `--color-text-main` | `#111111` |
| `--color-text-muted` | `#666666` |
| `--color-border` | `#eaeaea` |
| `--color-nav-bg` | `#ffffff` |
| `--color-surface` | `rgb(255 255 255 / 0.95)` |
| `--color-surface-elevated` | `rgb(255 255 255 / 0.98)` |
| `--color-glass-bg` | `rgb(255 255 255 / 0.62)` |
| `--color-glass-border` | `rgb(255 255 255 / 0.7)` |
| `--color-overlay` | `rgb(15 23 42 / 0.12)` |
| `--color-shadow` | `rgb(17 24 39 / 0.12)` |
| `--color-code-bg` | `#f8fafc` |
| `--color-code-header-bg` | `#eef4fb` |
| `--color-code-text` | `#1e293b` |
| `--color-code-border` | `#dbe4ef` |
| `--color-code-button-bg` | `rgb(255 255 255 / 0.96)` |
| `--color-code-button-border` | `#cbd5e1` |
| `--color-code-button-text` | `#475569` |
| `--color-code-button-hover-bg` | `#ffffff` |
| `--color-code-button-hover-border` | `#94a3b8` |
| `--color-code-button-hover-text` | `#0f172a` |
| `--color-scrollbar-thumb-hover` | `rgb(59 130 246)` |

<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:16px;margin:1.5rem 0;">
  <div style="border:1px solid var(--color-border);border-radius:14px;overflow:hidden;background:var(--color-surface-elevated);">
    <div style="height:72px;background:#eef7ff;"></div>
    <div style="padding:12px 14px;"><strong>--color-bg</strong><br><code>#eef7ff</code></div>
  </div>
  <div style="border:1px solid var(--color-border);border-radius:14px;overflow:hidden;background:var(--color-surface-elevated);">
    <div style="height:72px;background:#111111;"></div>
    <div style="padding:12px 14px;"><strong>--color-text-main</strong><br><code>#111111</code></div>
  </div>
  <div style="border:1px solid var(--color-border);border-radius:14px;overflow:hidden;background:var(--color-surface-elevated);">
    <div style="height:72px;background:#666666;"></div>
    <div style="padding:12px 14px;"><strong>--color-text-muted</strong><br><code>#666666</code></div>
  </div>
  <div style="border:1px solid var(--color-border);border-radius:14px;overflow:hidden;background:var(--color-surface-elevated);">
    <div style="height:72px;background:#eaeaea;"></div>
    <div style="padding:12px 14px;"><strong>--color-border</strong><br><code>#eaeaea</code></div>
  </div>
  <div style="border:1px solid var(--color-border);border-radius:14px;overflow:hidden;background:var(--color-surface-elevated);">
    <div style="height:72px;background:#53a3f1;"></div>
    <div style="padding:12px 14px;"><strong>--color-accent</strong><br><code>#53a3f1</code></div>
  </div>
  <div style="border:1px solid var(--color-border);border-radius:14px;overflow:hidden;background:var(--color-surface-elevated);">
    <div style="height:72px;background:#ffffff;"></div>
    <div style="padding:12px 14px;"><strong>--color-nav-bg</strong><br><code>#ffffff</code></div>
  </div>
</div>

## 黑暗模式

| 标识符 | 色号 |
| --- | --- |
| `--color-bg` | `#0f141d` |
| `--color-text-main` | `#f5f7fb` |
| `--color-text-muted` | `#b4bfcc` |
| `--color-border` | `rgb(255 255 255 / 0.14)` |
| `--color-nav-bg` | `rgb(15 20 29 / 0.92)` |
| `--color-surface` | `rgb(21 28 39 / 0.92)` |
| `--color-surface-elevated` | `rgb(24 32 45 / 0.98)` |
| `--color-glass-bg` | `rgb(21 28 39 / 0.6)` |
| `--color-glass-border` | `rgb(255 255 255 / 0.12)` |
| `--color-overlay` | `rgb(0 0 0 / 0.3)` |
| `--color-shadow` | `rgb(0 0 0 / 0.3)` |
| `--color-code-bg` | `#0f172a` |
| `--color-code-header-bg` | `#0b1220` |
| `--color-code-text` | `#e5e7eb` |
| `--color-code-border` | `rgb(148 163 184 / 0.22)` |
| `--color-code-button-bg` | `rgb(15 23 42 / 0.92)` |
| `--color-code-button-border` | `rgb(148 163 184 / 0.45)` |
| `--color-code-button-text` | `#cbd5e1` |
| `--color-code-button-hover-bg` | `rgb(30 41 59 / 0.96)` |
| `--color-code-button-hover-border` | `rgb(203 213 225 / 0.6)` |
| `--color-code-button-hover-text` | `#ffffff` |
| `--color-scrollbar-thumb-hover` | `rgb(147 197 253)` |

<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:16px;margin:1.5rem 0;">
  <div style="border:1px solid var(--color-border);border-radius:14px;overflow:hidden;background:var(--color-surface-elevated);">
    <div style="height:72px;background:#0f141d;"></div>
    <div style="padding:12px 14px;"><strong>--color-bg</strong><br><code>#0f141d</code></div>
  </div>
  <div style="border:1px solid var(--color-border);border-radius:14px;overflow:hidden;background:var(--color-surface-elevated);">
    <div style="height:72px;background:#f5f7fb;"></div>
    <div style="padding:12px 14px;"><strong>--color-text-main</strong><br><code>#f5f7fb</code></div>
  </div>
  <div style="border:1px solid var(--color-border);border-radius:14px;overflow:hidden;background:var(--color-surface-elevated);">
    <div style="height:72px;background:#b4bfcc;"></div>
    <div style="padding:12px 14px;"><strong>--color-text-muted</strong><br><code>#b4bfcc</code></div>
  </div>
  <div style="border:1px solid var(--color-border);border-radius:14px;overflow:hidden;background:var(--color-surface-elevated);">
    <div style="height:72px;background:rgb(255 255 255 / 0.14);"></div>
    <div style="padding:12px 14px;"><strong>--color-border</strong><br><code>rgb(255 255 255 / 0.14)</code></div>
  </div>
  <div style="border:1px solid var(--color-border);border-radius:14px;overflow:hidden;background:var(--color-surface-elevated);">
    <div style="height:72px;background:#53a3f1;"></div>
    <div style="padding:12px 14px;"><strong>--color-accent</strong><br><code>#53a3f1</code></div>
  </div>
  <div style="border:1px solid var(--color-border);border-radius:14px;overflow:hidden;background:var(--color-surface-elevated);">
    <div style="height:72px;background:rgb(15 20 29 / 0.92);"></div>
    <div style="padding:12px 14px;"><strong>--color-nav-bg</strong><br><code>rgb(15 20 29 / 0.92)</code></div>
  </div>
</div>

## 公用颜色

这些颜色在明亮模式和黑暗模式中保持一致。

| 标识符 | 色号 | 说明 |
| --- | --- | --- |
| `--color-accent` | `#53a3f1` | 站点主强调色，用于链接、标题装饰条、分类、标签与高亮状态 |
| `--color-scrollbar-track` | `transparent` | 滚动条轨道 |
| `--color-scrollbar-thumb` | `rgb(96 165 250)` | 滚动条滑块 |

<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:16px;margin:1.5rem 0;">
  <div style="border:1px solid var(--color-border);border-radius:14px;overflow:hidden;background:var(--color-surface-elevated);">
    <div style="height:72px;background:#53a3f1;"></div>
    <div style="padding:12px 14px;"><strong>--color-accent</strong><br><code>#53a3f1</code></div>
  </div>
  <div style="border:1px solid var(--color-border);border-radius:14px;overflow:hidden;background:linear-gradient(45deg,#d8dee9 25%,transparent 25%,transparent 50%,#d8dee9 50%,#d8dee9 75%,transparent 75%,transparent);background-size:16px 16px;">
    <div style="height:72px;background:transparent;"></div>
    <div style="padding:12px 14px;background:var(--color-surface-elevated);"><strong>--color-scrollbar-track</strong><br><code>transparent</code></div>
  </div>
  <div style="border:1px solid var(--color-border);border-radius:14px;overflow:hidden;background:var(--color-surface-elevated);">
    <div style="height:72px;background:rgb(96 165 250);"></div>
    <div style="padding:12px 14px;"><strong>--color-scrollbar-thumb</strong><br><code>rgb(96 165 250)</code></div>
  </div>
</div>

## 局部硬编码颜色

这些颜色不属于主题变量，但也确实出现在项目里。

| 色号 | 用途 |
| --- | --- |
| `#53a3f1` | 搜索框聚焦边框、PWA 主题色、测试内容中的内联文字颜色 |
| `#ffffff` | 局部文字、局部背景、PWA 背景色 |
| `#cbcbcb` | 首页 Hero 大字中的浅灰文字 |
| `#000` | 遮罩渐变中的纯黑 |
| `#ff5f57` | 代码块顶部红色圆点 |
| `#ffbd2e` | 代码块顶部黄色圆点 |
| `#28c840` | 代码块顶部绿色圆点 |
| `rgba(0, 0, 0, 0.1)` | `Alert` 组件阴影 |
| `rgba(0, 0, 0, 0.15)` | `Alert` 组件悬停阴影 |

<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:16px;margin:1.5rem 0;">
  <div style="border:1px solid var(--color-border);border-radius:14px;overflow:hidden;background:var(--color-surface-elevated);">
    <div style="height:72px;background:#ff5f57;"></div>
    <div style="padding:12px 14px;"><strong>macOS Red</strong><br><code>#ff5f57</code></div>
  </div>
  <div style="border:1px solid var(--color-border);border-radius:14px;overflow:hidden;background:var(--color-surface-elevated);">
    <div style="height:72px;background:#ffbd2e;"></div>
    <div style="padding:12px 14px;"><strong>macOS Yellow</strong><br><code>#ffbd2e</code></div>
  </div>
  <div style="border:1px solid var(--color-border);border-radius:14px;overflow:hidden;background:var(--color-surface-elevated);">
    <div style="height:72px;background:#28c840;"></div>
    <div style="padding:12px 14px;"><strong>macOS Green</strong><br><code>#28c840</code></div>
  </div>
</div>

## 备注

整体上，这套颜色更像是以实际视觉效果为目标逐步微调出来的主题，而不是一开始就完全按严格 token 体系推导出的配色系统。因此会看到一些非常接近、但并不完全均匀的黑白灰与透明度组合。
