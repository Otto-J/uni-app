# @dcloudio/uni-app

框架架构、生命周期等。

## build

rollup 使用 build.json

## src

- index.ts 入口
- ssr
- api
- hbx
- utils
- apiLifecycle

## 作用

```ts
onLoad(() => {
  console.log('23onLoad')
})
```

页面生命周期。零碎的其他用的不是很多。

生命周期通过 `createHook` 进行注册对应，进一步在 vue.injectHook 处理。
