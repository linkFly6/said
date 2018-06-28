import * as marked from 'marked'
import * as hljs from 'highlight.js'
import * as _ from 'lodash'
import * as url from 'url'
/**
 * https://github.com/SoapBox/linkifyjs
 * 解析文本链接
 */
const linkifyjs = require('linkifyjs/html')
/**
 * 载入 hashtag 插件，用于解析 #xxx 格式的文本
 */
require('linkifyjs/plugins/hashtag')(require('linkifyjs'))


/**
 * UTF-8 转 ASCII
 * @example hello, code => hello-code
 */
const transliteration = require('transliteration')
// import * as Prismjs from 'prismjs'
// Prismjs.languages.js = Prismjs.languages.javascript
// Prismjs.languages.ts = Prismjs.languages.typescript

/**
 * 匹配是否是 said 本站内容，如果是本站内容则不打开新页面跳转
 * //tasaid.com/home/cv?url=https%3A%2F%2Fmicrosoft.github.io%2FTypeSearch%2F
 * http://tasaid.com/home/cv?url=https%3A%2F%2Fmicrosoft.github.io%2FTypeSearch%2F
 * https://tasaid.com/home/cv?url=https%3A%2F%2Fmicrosoft.github.io%2FTypeSearch%2F
 */
const regSelfHref = /^((https?:)?\/\/tasaid.com)|^\/[^\/]/

/**
 * 匹配 url
 * https://baidu.com
 * 
 */
const regUrl = /(https:|http:)\/\/?(([0-9a-z_!~*'().&=+$%-]+: )?[0-9a-z_!~*'().&=+$%-]+@)?(([0-9]{1,3}\.){3}[0-9]{1,3}|([0-9a-z_!~*'()-]+\.)*([0-9a-z][0-9a-z-]{0,61})?[0-9a-z]\.[a-z]{2,6})(:[0-9]{1,4})?((\/?)|(\/[0-9a-z_!~*'().;?:@&=+$,%#-]+)+\/?)/

/**
 * markdown to html
 * @param context 
 * @param summary 
 */
export const convertMarkdown2HTML = (context: string) => {
  var renderer = new marked.Renderer()
  // 已存在的标题缓存，用于处理标题重复
  let headings: object = {}
  // 当前标题索引，如果标题重复，则将标题 ID 和这个累加的索引进行拼接，从而生成唯一标题 ID
  let index = 0
  // 重写 <hx> 标签的渲染
  renderer.heading = function (text: string, level: number) {
    // var escapedText = text.toLowerCase().replace(/[^\w]+/g, '-')
    let id = transliteration.slugify(text)
    // 标题存在重复，则添加一直自增的索引，让标题不再重复
    if (headings[id]) {
      id = `${id}-${index++}`
    }
    headings[id] = true
    // 注入 title 的 hash
    return `<h${level} id="${id}"><a class="saidfont icon-yinyong hash" aria-hidden="true" href="#${id}" name="${id}"></a><span>${text}</span></h${level}>`
    // return '<h' + level + '><a name="' +
    //   escapedText +
    //   '" class="anchor" href="#' +
    //   escapedText +
    //   '"><span class="header-link"></span></a>' +
    //   text + '</h' + level + '>'
  }

  // 重写 <a> 标签，跳转的逻辑修改
  renderer.link = createLink

  renderer.code = (code: string, language: string) => {
    return `<pre class="hljs"><code class="${language}">${
      // 如果在支持的语言列表里面就用该语言渲染，否则使用默认语言渲染
      hljs.getLanguage(language) ?
        hljs.highlight(language, code).value :
        hljs.highlightAuto(code).value
      }</code></pre>`
  }
  return marked(context, {
    renderer,
    // highlight: (code: string, lang: string, callback?: (error: any | undefined, code: string) => void) => {
    //   // callback(null, null)
    //   return hljs.highlightAuto(code).value
    // },

  })
}

/**
 * 根据参数生成 <a /> 标签
 */
export const createLink = (href: string, title: string, text: string) => {
  // 本页锚点
  if (!href) {
    href = ''
  }
  // 修正链接
  const url = fixeHref(href)
  if (url === href) {
    // 如果 url 和 href 相等，证明适合在当前页面跳转，详情参见 fixeLink
    return `<a href="${url}" title="${title || ''}">${text || ''}</a>`
  }
  // 跳转的链接，全部补上统计
  return `<a href="${url}" title="${title || ''}" target="_blank">${text || ''}</a>`
}

/**
 * 检查一个 url 是否是 said 域名下
 * 主要匹配 hash(#) 和 said 开头的域名
 * @param href 
 */
export const urlMatchSaid = (href: string) => {
  return href.startsWith('#') || regSelfHref.test(href)
}

/**
 * 修正 href 链接
 * #abc => 直接返回
 * //tasaid.com => 直接返回
 * https://sogou.com => //tasaid.com/link?url=${url}
 */
export const fixeHref = (href: string) => {
  if (!href || urlMatchSaid(href)) {
    return href
  }
  // 跳转的链接，全部补上统计
  return `//tasaid.com/link?url=${encodeURIComponent(href)}`
}

/**
 * 转换 Blog/Article 的简述
 * @param summary 
 * @param className 
 */
export const convertSummaryToHTML = (summary: string, className = '') => {
  return summary.split('\n').map(txt => `<p class="${className}">${txt}</p>`).join('')
}


/**
 * 转换评论内容到 HTML
 * 将 HTML 敏感字符干掉
 * 将每行内容包装为 <p />
 * 识别 context 中的链接，然后包装 <a /> 标签
 * @todo 后续可以考虑是否识别 @ 标签，因为 linkifyjs 支持识别
 * @param context 
 */
export const convertCommentToHTML = (context: string) => {
  const html = _.escape(context) // 将 HTML 内容转义 (防止 xss)
    .split('\n') // 换行符进行切割
    /**
     * @TODO 这里 length 为 1 也会包装
     */
    .map(txt => `<p>${txt}</p>`) // 每行用 <p /> 包装
    .join('')
  return linkifyjs(html, {
    /**
     * a 标签里面显示的文本，可以在这里做截断
     * 全部 type 类型参考这里：http://soapbox.github.io/linkifyjs/docs/linkify.html#linkifyfind-str--type
     * 这里只会命中 url 和 hashtag，因为 email 在 validate 禁掉了
     */
    // format: function (value: string, type: 'url' | 'hashtag') {
    //   return value
    // },
    /**
     * a 标签的 href
     */
    formatHref: function (href: string, type: 'url' | 'hashtag') {
      // console.log('2', type)
      return fixeHref(href)
    },
    /**
     * a 标签的 target
     */
    target: (href: string, type: 'url' | 'hashtag') => {
      /**
       * 这里的 href 是修正前的 href (尚未经过 formatHref())
       * 在这里根据 href 决定 <a /> 的 target 属性（页面跳转方式）
       */
      return type === 'hashtag' || urlMatchSaid(href) ?  null : '_blank'
    },
    /**
     * 对 url 进行校验
     */
    validate: {
      email: false,
      url: (value: string) => {
        /**
         * 过滤 ftp/email 格式的 url，只接受 http 的
         */
        return /^http(s)?:\/\//.test(value)
      }
    }
  })
}