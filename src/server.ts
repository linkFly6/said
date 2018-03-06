import * as dotenv from 'dotenv'
/**
 * 优先读取全局配置，否则后面有包使用了配置会找不到
 */
dotenv.config({ path: '.env' })

/**
 * Module dependencies.
 */
import * as express from 'express'
// import * as device from 'express-device'
// const device = require('express-device')
import * as compression from 'compression'  // compresses requests
import * as session from 'express-session'
import * as bodyParser from 'body-parser'
import * as errorHandler from 'errorhandler'
import * as lusca from 'lusca'
import * as mongo from 'connect-mongo'
// import * as flash from 'express-flash'
import * as path from 'path'
import * as mongoose from 'mongoose'
import * as passport from 'passport'
import * as log from './utils/log'
import router from './middleware/routers'
import { actionHandler } from './applications/router'
import * as cookieParser from 'cookie-parser'
import expressValidator = require('express-validator')
// https://github.com/Daplie/greenlock-express
const greenlock = require('greenlock-express')


import { routerErrorHandler, safeRouterHandler, log as appLog } from './applications'


const MongoStore = mongo(session)


/**
 * Controllers (route handlers).
 */
import * as homeController from './controllers/home'
import * as blogController from './controllers/blog'
import * as saidController from './controllers/article'

/**
 * API keys and Passport configuration.
 */
import * as passportConfig from './config/passport'
import { isMobileDevice } from './utils/device'
import { DEVICE } from './models/server/enums'
import { getAdminInfoByToken } from './services/admin-service'
import { createUser, getUserInfoByToken } from './services/user-service'
import { IUser, UserRole } from './models/user'
import { SimpleAdmin } from 'admin'
import { Response } from 'express'

/**
 * Create Express server.
 */
const app = express()




/**
 * Connect to MongoDB.
 */
// mongoose.Promise = global.Promise;
mongoose.connect(process.env.MONGODB_URI || process.env.MONGOLAB_URI)

mongoose.connection.on('error', () => {
  // console.log('MongoDB connection error. Please make sure MongoDB is running.')
  process.exit()
})

/**
 * Express configuration.
 */
app.set('port', process.env.PORT || 3000)
app.set('views', path.join(__dirname, './views'))
app.set('view engine', 'pug')

app.use(compression())

app.use(log.Log4js.connectLogger(log.accessLogger, { level: log.accessLogger.level }))
app.use(cookieParser())
// 注意 bodyParser 不处理 multipart/form-data 的请求
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
// app.use(device.capture())
app.use(expressValidator())
app.use(session({
  resave: true,
  saveUninitialized: true,
  secret: process.env.SESSION_SECRET,
  store: new MongoStore({
    url: process.env.MONGODB_URI || process.env.MONGOLAB_URI,
    autoReconnect: true,
  }),
}))
// app.use(passport.initialize())
// app.use(passport.session())
// app.use(flash())
// app.use(lusca.xframe('SAMEORIGIN'))
// app.use(lusca.xssProtection(true))
// app.use((req, res, next) => {
//   res.locals.user = req.user
//   next()
// })
// app.use((req, res, next) => {
//   // After successful login, redirect back to the intended page
//   if (!req.user &&
//     req.path !== '/login' &&
//     req.path !== '/signup' &&
//     !req.path.match(/^\/auth/) &&
//     !req.path.match(/\./)) {
//     req.session.returnTo = req.path
//   } else if (req.user &&
//     req.path == '/account') {
//     req.session.returnTo = req.path
//   }
//   next()
// })
app.use('/static', express.static(path.join(__dirname, 'public'), { maxAge: 31557600000 }))


/**
 * 获取用户 token 和 基本信息
 * 之所以特殊针对 res 写 Response 是因为 src/types/global.d.ts 中针对 Response 进行了扩展
 * 默认参数直接引用了 express 内部的 Response，而 global.d.ts 是针对 express 曝露出来的 Response 进行的扩展
 * 如果去掉则 res.locals 就无法识别 global.d.ts 中定义的类型了
 */
app.use(async (req, res: Response, next) => {
  let params = req.method === 'GET'
    ? req.query : req.body
  const token = params.token || req.cookies.token
  // 没有 token 信息，则表示不是管理员
  if (token) {
    try {
      const admin = await getAdminInfoByToken(token)
      if (admin) {
        res.locals.admin = admin
      }
    } catch (error) {
      // getUserInfoByToken 内部已经打了 log，所以这里不用再打了
    }

  }
  // 获取用户信息，user token
  // 为了安全起见，服务端只认 token 而不认 uid
  let userToken = req.cookies.ut
  if (userToken) {
    try {
      const userInfo = await getUserInfoByToken(userToken)
      if (!userInfo) {
        // 把 userToken 清空，从而触发下面的逻辑重新注入 token
        userToken = null
      } else {
        // 注入到 user 中
        res.locals.user = userInfo
      }
    } catch (error) {
      userToken = null
    }
  }
  if (!userToken) {
    let user: IUser = {
      role: UserRole.NORMAL,
    } as any
    // 有管理员信息，则把管理员信息复制到用户中
    if (res.locals.admin) {
      const admin: SimpleAdmin = res.locals.admin
      user.email = admin.email
      user.nickName = admin.nickName
      user.role = UserRole.ADMIN
    }
    // 保存到数据库
    const userInfo = await createUser(user)
    if (!userInfo) {
      // 跳转到服务器异常
      res.redirect('/error', 500)
      return
    }
    res.locals.user = userInfo.user
    // 注入到 cookie https://segmentfault.com/a/1190000004139342
    res.cookie('ut', userInfo.token, { maxAge: 31536E7 }) // 10 years
  }
  next()
})

router({
  app: app,
  handler: actionHandler,
  root: path.join(__dirname, 'controllers'),
})

// 判断是否来自移动设备中间件
app.use((req, res, next) => {
  const ua = req.headers['user-agent']
  res.locals.device = isMobileDevice(ua) ? DEVICE.MOBILE : DEVICE.DESKTOP
  return next()
})


/**
 * app router
 */
app.get('/', safeRouterHandler(homeController.index))
app.get('/rebots.txt', safeRouterHandler(homeController.rebots))
app.get('/link', safeRouterHandler(homeController.link))
// 后台系统
app.get('/back/?*', safeRouterHandler(homeController.backend))

app.get('/blog/:key.html', safeRouterHandler(blogController.detail))
app.get('/blog', safeRouterHandler(blogController.index))
app.get('/blog/cate/:category', safeRouterHandler(blogController.index))

app.post('/blog/like', safeRouterHandler(blogController.userLike))

app.get('/said/:key.html', safeRouterHandler(saidController.detail))
app.get('/said', safeRouterHandler(saidController.index))
app.get('/said/page/:page?', safeRouterHandler(saidController.index))
app.get('/said/get/:page', safeRouterHandler(saidController.getArticlesByPage))

app.post('/said/like', safeRouterHandler(saidController.userLike))

/**
 * 404
 */
app.all('/404(.html)?', homeController.noFound)
/**
 * 服务器异常
 */
app.all('/500(.html)?', homeController.error)
/**
 * 全局错误处理
 */
app.use(routerErrorHandler)

/**
 * 如果前面的路由都没有匹配到，则默认跳转到 404
 */
app.use(homeController.noFound)



/**
 * Error Handler. Provides full stack - remove for production
 */
// app.use(errorHandler())


if (process.env.NODE_ENV === 'production') {
  // 线上启用 HTTPS
  const lex = greenlock.create({
    server: 'staging',
    // server: 'https://acme-v01.api.letsencrypt.org/directory',
    challenges: { 'http-01': require('le-challenge-fs').create({ webrootPath: '~/letsencrypt/var/acme-challenges' }) },
    store: require('le-store-certbot').create({ webrootPath: '~/letsencrypt/srv/www/:hostname/.well-known/acme-challenge' }),
    // agreeTos: true,
    approveDomains: (opts: any, certs: any, cb: any) => {
      appLog.info('approveDomains', { opts, certs })
      if (certs) {
        opts.domains = certs.altnames
      }
      else {
        opts.email = 'linkFly6@live.com'
        opts.agreeTos = true
      }
      cb(null, { options: opts, certs: certs })
    },
    // app,
  })
  require('http').createServer(lex.middleware(require('redirect-https')())).listen(80, function () {
    console.log('Listening for ACME http-01 challenges on', this.address())
  })
  require('https').createServer(lex.httpsOptions, lex.middleware(app)).listen(443, function () {
    console.log('Listening for ACME tls-sni-01 challenges and serve app on', this.address())
  })
} else {
  /**
   * Start Express server.
   */
  app.listen(app.get('port'), () => {
    // console.log(('  App is running at http://localhost:%d in %s mode'), app.get('port'), app.get('env'))
    // console.log('  Press CTRL-C to stop\n')
  })
}

module.exports = app
