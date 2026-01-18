# Design: Authentication UI Redesign

## Overview

本文档描述了登录和注册页面的新设计架构，包括布局结构、视觉风格和响应式策略。

## Layout Structure

### Desktop Layout (> 768px)

采用分屏布局，将页面分为左右两个区域：

#### LoginView

```
+----------------------------------+
|  [Logo+欢迎区域]  |  [表单区域]  |
|                  |              |
|                  |              |
+----------------------------------+
```

#### SignupView

```
+----------------------------------+
|  [表单区域]  |  [Logo+欢迎区域]  |
|              |                  |
|              |                  |
+----------------------------------+
```

### Mobile Layout (<= 768px)

垂直堆叠布局，logo和"欢迎！"在上，表单在下：

```
+----------------------------------+
|       [Logo+欢迎区域]              |
|                                  |
+----------------------------------+
|       [表单区域]                  |
|                                  |
+----------------------------------+
```

## Visual Design

### Container Styling

- **悬浮效果**: 使用 `box-shadow` 创建悬浮感
- **圆角**: `border-radius: 16px` 或更大
- **背景**: 白色或浅色背景
- **尺寸**: 固定宽高比或最大宽度限制

### Logo and Welcome Text Layout

- Logo 不使用模糊效果，清晰显示
- Logo 不占满容器，适当大小
- "欢迎！"文字与 Logo 垂直居中对齐
- "欢迎！"文字使用与 Logo 大小匹配的字体大小
- 添加出现动画效果

### Form Styling

- 保持现有表单样式（输入框、按钮、错误提示）
- 调整间距以适应新布局
- 确保表单在容器中居中

## Technical Implementation

### Component Structure

```
LoginView.vue
├── .auth-container (主容器)
│   ├── .logo-section (Logo区域)
│   │   ├── <img> (清晰logo)
│   │   └── <div class="welcome-text"> (欢迎！文字)
│   └── .form-section (表单区域)
│       └── <form> (现有表单)
```

### CSS Architecture

使用 CSS Grid 或 Flexbox 实现响应式布局：

```css
.auth-container {
  display: grid;
  grid-template-columns: 1fr 1fr; /* 桌面端 */
  gap: 2rem;
}

@media (max-width: 768px) {
  .auth-container {
    grid-template-columns: 1fr; /* 移动端 */
  }
}
```

### Logo and Welcome Text Positioning

- LoginView: `.logo-section` 在左侧，包含 Logo 和"欢迎！"文字
- SignupView: `.logo-section` 在右侧，包含 Logo 和"欢迎！"文字
- Logo 和"欢迎！"文字垂直居中对齐
- 添加出现动画

## Responsive Strategy

### Breakpoints

- **Mobile**: ≤ 640px
- **Tablet**: 641px - 768px
- **Desktop**: > 768px

### Adaptations

1. **Mobile**: 垂直堆叠，logo在上，表单在下
2. **Tablet**: 保持分屏，但减小间距和字体大小
3. **Desktop**: 完整分屏布局

## Accessibility Considerations

- 确保 Logo 和"欢迎！"文字不影响屏幕阅读器
- 保持表单元素的键盘导航
- 确保颜色对比度符合 WCAG 标准
- 为 Logo 添加适当的 `alt` 文本
- 确保动画不会引起眩晕或不适

## Performance Considerations

- Logo 不使用模糊效果，减少渲染负担
- 考虑使用 `will-change: opacity, transform` 优化动画渲染
- 确保logo图片已优化（WebP格式）
- 动画使用 CSS transform 和 opacity，性能良好

## Trade-offs

### Chosen Approach: Clear Logo with Welcome Text

**优点**:

- Logo 清晰显示，品牌识别度更高
- "欢迎！"文字增强用户体验
- 无模糊效果，性能更好
- 动画效果提升视觉吸引力

**缺点**:

- 需要额外的 DOM 元素
- 动画可能影响性能（但使用 CSS 优化）

**决策**: 使用清晰 Logo 配合"欢迎！"文字和出现动画，提升用户体验和品牌展示。

## Future Enhancements

- 添加背景动画或渐变效果
- 支持深色模式
- 添加社交登录按钮
- 实现表单切换动画（登录/注册之间切换）
