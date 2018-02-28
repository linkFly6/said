/**
 * Module dependencies.
 */
import * as express from 'express'
// import * as device from 'express-device'
const device = require('express-device')
import * as compression from 'compression'  // compresses requests
import * as session from 'express-session'
import * as bodyParser from 'body-parser'
import * as errorHandler from 'errorhandler'
import * as lusca from 'lusca'
import * as dotenv from 'dotenv'
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



const MongoStore = mongo(session)

/**
 * Load environment variables from .env file, where API keys and passwords are configured.
 */
dotenv.config({ path: '.env.example' })



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
app.use(express.static(path.join(__dirname, 'public'), { maxAge: 31557600000 }))


// 获取用户 token 和 基本信息
app.use(async (req, res, next) => {
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
 * Primary app routes.
 */
app.get('/', homeController.index)

app.get('/blog/:key.html', blogController.detail)
app.get('/blog', blogController.index)
app.get('/blog/cate/:category', blogController.index)

app.post('/blog/like', blogController.userLike)

app.get('/said/:key.html', saidController.detail)
app.get('/said', saidController.index)
app.get('/said/page/:page?', saidController.index)

app.post('/said/like', saidController.userLike)

// app.get('/login', userController.getLogin)
// app.post('/login', userController.postLogin)
// app.get('/logout', userController.logout)
// app.get('/forgot', userController.getForgot)
// app.post('/forgot', userController.postForgot)
// app.get('/reset/:token', userController.getReset)
// app.post('/reset/:token', userController.postReset)
// app.get('/signup', userController.getSignup)
// app.post('/signup', userController.postSignup)
// app.get('/contact', contactController.getContact)
// app.post('/contact', contactController.postContact)
// app.get('/account', passportConfig.isAuthenticated, userController.getAccount)
// app.post('/account/profile', passportConfig.isAuthenticated, userController.postUpdateProfile)
// app.post('/account/password', passportConfig.isAuthenticated, userController.postUpdatePassword)
// app.post('/account/delete', passportConfig.isAuthenticated, userController.postDeleteAccount)
// app.get('/account/unlink/:provider', passportConfig.isAuthenticated, userController.getOauthUnlink)

// /**
//  * API examples routes.
//  */
// app.get('/api', apiController.getApi)
// app.get('/api/facebook', passportConfig.isAuthenticated, passportConfig.isAuthorized, apiController.getFacebook)

// /**
//  * OAuth authentication routes. (Sign in)
//  */
// app.get('/auth/facebook', passport.authenticate('facebook', { scope: ['email', 'public_profile'] }))
// app.get('/auth/facebook/callback', passport.authenticate('facebook', { failureRedirect: '/login' }), (req, res) => {
//   res.redirect(req.session.returnTo || '/')
// })


/**
 * Error Handler. Provides full stack - remove for production
 */
app.use(errorHandler())

/**
 * Start Express server.
 */
app.listen(app.get('port'), () => {
  // console.log(('  App is running at http://localhost:%d in %s mode'), app.get('port'), app.get('env'))
  // console.log('  Press CTRL-C to stop\n')
})

module.exports = app
