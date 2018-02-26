import * as marked from 'marked'
import * as hljs from 'highlight.js'
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
  renderer.link = (href: string, title: string, text: string) => {
    // 本页锚点
    if (!href) {
      href = ''
    }
    if (href.startsWith('#') || regSelfHref.test(href)) {
      return `<a href="${href}" title="${title || ''}">${text}</a>`
    }
    // 跳转的链接，全部补上统计
    const url = `//tasaid.com/home/sv?url=${encodeURIComponent(href)}`
    return `<a href="${url}" title="${title || ''}" target="_blank">${text}</a>`
  }

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
 * 转换 Blog/Article 的简述
 * @param summary 
 * @param className 
 */
export const convertSummaryToHTML = (summary: string, className = '') => {
  return summary.split('\n').map(txt => `<p class="${className}">${txt}</p>`).join('')
}