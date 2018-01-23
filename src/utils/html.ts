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
  // var renderer = new marked.Renderer()
  // renderer.heading = function (text, level) {
  //   var escapedText = text.toLowerCase().replace(/[^\w]+/g, '-')

  //   return '<h' + level + '><a name="' +
  //     escapedText +
  //     '" class="anchor" href="#' +
  //     escapedText +
  //     '"><span class="header-link"></span></a>' +
  //     text + '</h' + level + '>'
  // }
  return marked(context, {
    // renderer
    highlight: (code: string, lang: string, callback?: (error: any | undefined, code: string) => void) => {
      // callback(null, null)
      return hljs.highlightAuto(code).value
    }
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