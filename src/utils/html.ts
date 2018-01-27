import * as marked from 'marked'
import * as hljs from 'highlight.js'
// import * as Prismjs from 'prismjs'
// Prismjs.languages.js = Prismjs.languages.javascript
// Prismjs.languages.ts = Prismjs.languages.typescript

/**
 * markdown to html
 * @param context 
 * @param summary 
 */
export const convertMarkdown2HTML = (context: string) => {
  var renderer = new marked.Renderer()
  // 重写 <hx> 标签的渲染
  renderer.heading = function (text: string, level: number) {
    // var escapedText = text.toLowerCase().replace(/[^\w]+/g, '-')
    const escapedText = text.toLowerCase()
    // 注入 title 的 hash
    return `<h${level} id="${escapedText}"><a class="fa fa-link hash" aria-hidden="true" href="#${escapedText}" name="${escapedText}"></a><span>${text}</span></h${level}>`
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
    if (href.startsWith('#')) {
      return `<a href="${href}" title="${title}">${text}</a>`
    }
    // 跳转的链接，全部补上统计
    const url = `//tasaid.com/home/cv?url=${encodeURIComponent(href)}`
    return `<a herf="${url}" title="${title}" target="_blank">${text}</a>`
  }
  return marked(context, {
    renderer,
    highlight: (code: string, lang: string, callback?: (error: any | undefined, code: string) => void) => {
      // callback(null, null)
      return hljs.highlightAuto(code).value
    },
    
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