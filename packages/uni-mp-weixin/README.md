# @dcloudio/uni-mp-weixin

微信小程序平台依赖包

- dist：编译后的文件
- lib：其他依赖
- src：源文件
  - api：uni 对象接口适配，抹平 wx 对象的平台差异
  - compiler：编译器（当前平台独有部分）
  - runtime：运行时框架生命周期等
  - platform：用于为框架提供统一的接口，对应 @dcloudio/uni-platform
