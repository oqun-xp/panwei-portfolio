## 为什么要做这个插件

做电商素材整理时，最麻烦的不是下载，而是**找全**。商品主图、细节图、详情长图分散在轮播、懒加载和 CSS 背景里，逐张右键保存既容易遗漏，也会把图标和占位图一起存下来。

图提取 ImageGrab 的目标很明确：在商品详情页点一次按钮，把页面里所有有价值的商品图集中到一个画廊里，勾选后统一转成 PNG 下载。

## 核心设计

### 1. 多来源扫描

内容脚本同时扫描以下来源：

- `img` 的 `src` 与 `currentSrc`
- `srcset` 中的候选地址
- `data-src`、`data-lazy-src`、`data-original` 等懒加载属性
- 内联样式与样式表中的 `background-image`

```js
const candidates = new Map();

function addCandidate(url, width, height) {
  if (!url || candidates.has(url)) return;
  candidates.set(url, { url, width, height });
}
```

使用 `Map` 去重，同时保留首次出现顺序。

### 2. 过滤策略

电商页面里混着大量 UI 资源，如果全部展示，画廊会变得非常嘈杂。当前策略是：

- 小于 `150 × 150` 的图片排除
- 长宽比超过 `6:1` 的装饰条排除
- URL 中包含 `logo`、`icon`、`sprite`、`placeholder` 等关键词的排除
- 加载失败的图片排除

在真实京东商品页测试时，这套规则把 43 张候选图收敛到了 16 张，主图与详情图都被保留下来。

### 3. PNG 转换

画廊页优先直接 `fetch` 图片并绘制到 Canvas：

```js
const response = await fetch(url, { credentials: 'omit' });
const blob = await response.blob();
const bitmap = await createImageBitmap(blob);
const canvas = document.createElement('canvas');
canvas.width = bitmap.width;
canvas.height = bitmap.height;
canvas.getContext('2d').drawImage(bitmap, 0, 0);
```

如果画廊页跨域受限，就把 URL 交给 Service Worker，用 `OffscreenCanvas` 再尝试一次。最终通过 `chrome.downloads.download` 保存为 `商品图_001.png` 这样的文件名。

## 踩过的坑

### `naturalWidth` 不等于真实像素

带 `srcset` 的图片，`naturalWidth` 会按像素密度折算。一张 760px 的 2x 图可能被读成 380px，导致尺寸展示错误。解决方案是：带 `srcset` 的候选图不直接使用 DOM 尺寸，而是重新创建 `Image` 测量真实像素。

### 跨域图片与权限

图片常常挂在 `360buyimg.com`、`alicdn.com` 等 CDN 上，必须把对应域名加入 `host_permissions`，Canvas 才能读取像素。

### 下载并发

批量下载时如果一次性并发几十张图片，内存和网络都会吃紧。现在改为顺序处理，并在界面上显示 `7/10` 的进度和当前文件名，失败项会汇总提示。

## 总结

这个项目让我完整走了一遍 Chrome 扩展的开发流程：Manifest V3、内容脚本、Service Worker、跨域处理、下载 API 和画廊 UI。相比“能跑”，更难的是在真实页面里把噪音过滤掉，让用户一眼看到有用的图片。
