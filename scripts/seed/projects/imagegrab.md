## 项目简介

图提取 ImageGrab 是一个 Chrome Manifest V3 扩展，用于在电商商品详情页批量提取图片并下载为 PNG。支持淘宝 / 天猫、京东、拼多多商家版。

## 核心功能

- 在详情页右下角注入「获取图片」悬浮按钮
- 扫描 `img`、`srcset`、`data-src`、背景图与懒加载图片
- 过滤图标、logo、占位图与小于 150×150 的图片
- 新标签页集中预览，支持全选、反选与逐张勾选
- 批量转换为 PNG，按 `商品图_001.png` 规则命名
- 下载进度与失败反馈

## 技术要点

- **Manifest V3**：内容脚本负责注入与提取，Service Worker 负责画廊与下载
- **跨域处理**：通过 `host_permissions` 与 Service Worker `fetch + OffscreenCanvas` 兜底
- **真实页面验证**：在真实京东商品页提取到 16 张有效图片，并将 1350×1350 原图成功转为 PNG
- **官网**：`docs/` 下的纯静态宣传站，通过 GitHub Pages 发布

## 成果

- 插件源码与使用说明已开源到 GitHub
- 宣传官网：https://oqun-xp.github.io/imagegrab/
- 完整经历了需求分析、AI 编程、Bug 排查、Git 推送与 Pages 部署流程
