# @dcloudio/uni-components

运行时全局组件，平台公用

## 内部依赖

- `uni-cloud`
- `uni-h5`
- `uni-i18n`

## 目录结构

- `style` 文件夹，包含了各类样式。
- `src/components` 通用 默认组件类型
- `src/helper` 各类方法
- `src/vue` vue 组件方法，使用 `defineBuiltInComponent` 包装，背后是 `vue.defineComponet` 的包装
