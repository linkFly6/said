Said - 听说
====


```
                                    
    //   ) )                        
   ((         ___     ( )  ___   /  
     \\     //   ) ) / / //   ) /   
       ) ) //   / / / / //   / /    
((___ / / ((___( ( / / ((___/ /   @ by linkFly     

```

感谢 [@Jemair](https://github.com/Jemair) 共同开发。

个人博客站 - 《[听说](http://www.tasaid.com/)》：
- [首页](http://www.tasaid.com/)
- [blog](https://tasaid.com/Blog)
- [听说](http://tasaid.com/said)
- [项目](http://tasaid.com/projects)
- 实验室(正在开发中)


或者参与到我的其他项目：《[moles - 前端集成工具](https://github.com/linkFly6/moles)》

&nbsp;

前端开发QQ群：377786580&nbsp;&nbsp;&nbsp;&nbsp;<a target="_blank" href="http://shang.qq.com/wpa/qunwpa?idkey=cb56d5db68d2001c42a3264df3bcd7e752713141fd2a3fb267b336c9b12487b8"><img border="0" src="http://pub.idqqimg.com/wpa/images/group.png" alt="JavaScript - 前端开发" title="JavaScript - 前端开发"></a>


## 开发和启动

- 安装 [kitematic](https://kitematic.com/)（本地 `docker` 容器）
- 在 `kitematic` 中安装 `mongodb`
- 修改 `.env.example` 文件中的 `MONGODB_URI` 字段，修改为本地或 `dokcer` 容器中的地址
- 安装 [GraphicsMagick](http://www.graphicsmagick.org/)（图像处理引擎，`os x` 中可以 `brew install imagemagick` 安装）
- 执行命令：

```bash
$ npm i --d # 安装依赖包
$ npm run dev # 启动服务
```


## 开发计划

- controller 需要支持 render
- 访问量/阅读量/浏览量：通过 log 文件定期收集(例如 10min)
- 前台访问用 cookie，后台 + 前台管理员访问接口带 token， token 每次进行校验


### 关于 controller 设计

- `signatureWithOption` 签名的 `Filter` 中，`Filter.use` 没有传入 `signatureWithOption` 签名的配置
- 普通的请求和 `multipart/form-data` 中，如何取到 `token` 和对应的预处理不互斥
  > 例如 Filter1 挂载到全局 `app.use`，如果取不到 `token` 就报错，那么在 Filter2 处理 `multipart/form-data` 的请求中，如何让 Filter 1 不报错
- 如果要写一个 noFilter 呢？

controller 是不是不应该设置全局请求？(`app.use`)

## 规范

### 返回接口

所有的接口返回的数据结构都使用 `{ code: number, message: string, data: any }`。


## 版权

[Said](https://github.com/linkFly6/Said) 项目代码和内容均采用 [知识共享署名3.0 ( CC Attribution-NonCommercial )](https://creativecommons.org/licenses/by-nc/3.0/) 许可，并且 [Said](https://github.com/linkFly6/Said) 项目和代码还采用 [GPL](http://choosealicense.com/licenses/gpl-3.0/) 协议。

您必须遵循以下要求(包括但不局限于)：

 - 署名
 - 禁止商业演绎
 
 
 
 如果您希望特殊授权，请联系作者 [linkFly](mailto:linkFly6@live.com) 单独授权，则可以不必遵循以上授权协议。

