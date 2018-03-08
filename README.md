# Said - 听说

----


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
- 修改 `.env` 文件中的 `MONGODB_URI` 字段，修改为本地或 `dokcer` 容器中的地址
- 修改 `.env` 文件中的 `QINIU_ACCESSKEY/QINIU_SECRETKEY`（七牛云存储密匙）
- 执行命令：

```bash
$ npm i --d # 安装依赖包
$ npm run dev # 启动服务
```

## 部署

```bash
$ sh build.sh # 构建会产出 said-temp 和 said-temp.tar.gz
# copy 将打包后的文件上传 github，服务器 wget 下载，或者直接上传到服务器上
$ # 服务器中执行 tar zxvf ./said-temp.tar.gz
$ cd said-temp
$ sh deploy.sh # 进行部署
```


## TODO LIST

- ~~资源全部替换到 CDN 中~~
- 统计接口，取参数 `sv`，目前外链都没有做统计处理
- 日志详情页，右侧目录导航在目录项折行的情况下不准确的 bug fix，还是计算精度不准确的问题（内嵌 iframe）
- ~~测试生产环境下，`express` 对于错误页的处理~~
- 确认后台管理员登录失效的逻辑
- ~~HTTPS~~
- ~~部署脚本中需要 copy `robots.txt` 到网站根目录下（或者指定 url）~~
- ~~从 `www.tasaid.com` 访问的流量全部自动跳转到 `tasaid.com` (不带 `www`)~~
- controller 需要支持 render
- 访问量/阅读量/浏览量：通过 log 文件定期收集(例如 10min)
- 前台访问用 cookie，后台 + 前台管理员访问接口带 token， token 每次进行校验
- ~~服务异常需要显示错误页~~
- ~~部署脚本压缩 js 和 css(最好 js 和 css 能单独部署到 cdn)~~
- 编译方式优化，优化 `stylus` 文件编译产出路径和 `src` 目录不一致的问题
- 关于页可以做成动态文字输入的形式，然后背景放上蒙版跟随鼠标 3d 偏移
- 每个页面的样式太集中了，需要拆出模块
- 后台登录 cookie 设置为 `http-only`
- ~~用户 like 动作应该写入记录，每个用户针对该文章只能 like 一次~~
- 评论和报警发送邮件
- 移动端查看文章图片的效果，做成类似 `ios` 系统查看图片那样的效果
- 一段时间后支持 HTTP严格传输安全(`HSTS`)
- ~~支持 HTTP/2~~
- 文章很久没更新要加 tips
- 删除 `package.json` 中无用的包

### 关于 controller 设计

- `signatureWithOption` 签名的 `Filter` 中，`Filter.use` 没有传入 `signatureWithOption` 签名的配置
- 普通的请求和 `multipart/form-data` 中，如何取到 `token` 和对应的预处理不互斥
  > 例如 Filter1 挂载到全局 `app.use`，如果取不到 `token` 就报错，那么在 Filter2 处理 `multipart/form-data` 的请求中，如何让 Filter 1 不报错
- 如果要写一个 noFilter 呢？

controller 是不是不应该设置全局请求？(`app.use`)

## 规范

### 返回接口

所有的接口返回的数据结构都使用 `{ code: number, message: string, data: any }`。

### 全局统计

默认全局统计使用的参数全部都是 `sv`

### 其他

本仓库 fork 自 [https://github.com/Microsoft/TypeScript-Node-Starter](https://github.com/Microsoft/TypeScript-Node-Starter) 仓库并进行的针对性开发。



## 版权

[Said](https://github.com/linkFly6/Said) 项目代码和内容均采用 [知识共享署名3.0 ( CC Attribution-NonCommercial )](https://creativecommons.org/licenses/by-nc/3.0/) 许可，并且 [Said](https://github.com/linkFly6/Said) 项目和代码还采用 [GPL](http://choosealicense.com/licenses/gpl-3.0/) 协议。

您必须遵循以下要求(包括但不局限于)：

 - 署名
 - 禁止商业演绎
 
 
 
 如果您希望特殊授权，请联系作者 [linkFly](mailto:linkFly6@live.com) 单独授权，则可以不必遵循以上授权协议。

