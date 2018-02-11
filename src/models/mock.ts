
/**
 * //s1.ax1x.com/2018/02/11/9Gh3TJ.png
 * //s1.ax1x.com/2018/02/11/9GhNSx.png
 * //s1.ax1x.com/2018/02/11/9GhUl6.png
 */

export const blogContent =`<p>在 <a href="//tasaid.com/home/cv?url=http%3A%2F%2Ftasaid.com%2Fblog%2F20171011231943.html%3Fsgs%3Dcnblog" title="null" target="_blank">《从 JavaScript 到 TypeScript 系列》</a> 文章我们已经学习了 TypeScript 相关的知识。
TypeScript 的核心在于静态类型，我们在编写 TS 的时候会定义很多的类型，但是主流的库都是 JavaScript 编写的，并不支持类型系统。那么如何让这些第三方库也可以进行类型推导呢？</p>
<p>这篇文章我们来讲解 JavaScript 和 TypeScript 的静态类型交叉口 —— 类型定义文件。</p>
<p>这篇文章首发于我的个人博客 《<a href="//tasaid.com/home/cv?url=http%3A%2F%2Ftasaid.com%3Fsgs%3Dcnblog" title="null" target="_blank">听说</a>》。</p>
<blockquote>
<p>前端开发 QQ 群：377786580</p>
</blockquote>
<h2 id="类型定义文件"><a class="fa fa-link hash" aria-hidden="true" href="#类型定义文件" name="类型定义文件"></a><span>类型定义文件</span></h2><p>在 TypeScript 中，我们可以很简单的，在代码编写中定义类型：</p>
<pre class="hljs"><code class="typescript"><span class="hljs-keyword">interface</span> IBaseModel {
  say(keys: <span class="hljs-built_in">string</span>[] | <span class="hljs-literal">null</span>): object
}

<span class="hljs-keyword">class</span> User <span class="hljs-keyword">implements</span> IBaseModel {
  name: <span class="hljs-built_in">string</span>
  <span class="hljs-keyword">constructor</span> (<span class="hljs-params">name: <span class="hljs-built_in">string</span></span>) {
    <span class="hljs-keyword">this</span>.name = name
  }
}</code></pre><p>但是主流的库都是 JavaScript 编写的，TypeScript 身为 JavaScript 的超集，自然需要考虑到如何让 JS 库也能定义静态类型。</p>
<p>TypeScript 经过了一系列的摸索，先后提出了 <a href="//tasaid.com/home/cv?url=https%3A%2F%2Fgithub.com%2FDefinitelyTyped%2Ftsd" title="null" target="_blank">tsd</a>(已废弃)、<a href="//tasaid.com/home/cv?url=https%3A%2F%2Fgithub.com%2Ftypings%2Ftypings" title="null" target="_blank">typings</a>(已废弃)，最终在 TypeScript 2.0 的时候重新整理了类型定义，提出了 <a href="//tasaid.com/home/cv?url=https%3A%2F%2Fgithub.com%2FDefinitelyTyped%2FDefinitelyTyped" title="null" target="_blank">DefinitelyTyped</a>。</p>
<p><a href="//tasaid.com/home/cv?url=https%3A%2F%2Fgithub.com%2FDefinitelyTyped%2FDefinitelyTyped" title="null" target="_blank">DefinitelyTyped</a> 就是让你把 &quot;类型定义文件(*.d.ts)&quot;，发布到 <code>npm</code> 中，配合编辑器(或插件)，就能够检测到 JS 库中的静态类型。</p>
<p>类型定义文件的以 <code>.d.ts</code> 结尾，里面主要用来定义类型。</p>
<p>例如这是 <a href="//tasaid.com/home/cv?url=https%3A%2F%2Fgithub.com%2FDefinitelyTyped%2FDefinitelyTyped%2Ftree%2Fmaster%2Ftypes%2Fjquery" title="null" target="_blank">jQuery 的类型定义文件</a> 中一段代码（为了方便理解做了一些改动）</p>
<pre class="hljs"><code class="typescript"><span class="hljs-comment">// 定义 jQuery 需要用到的类型命名空间</span>
<span class="hljs-keyword">declare</span> <span class="hljs-keyword">namespace</span> JQuery {
    <span class="hljs-comment">// 定义基本使用的类型</span>
    <span class="hljs-keyword">type</span> Selector = <span class="hljs-built_in">string</span>;
    <span class="hljs-keyword">type</span> TypeOrArray&lt;T&gt; = T | T[];
    <span class="hljs-keyword">type</span> htmlString = <span class="hljs-built_in">string</span>;
}

<span class="hljs-comment">// 定义 jQuery 接口，jquery 是一个 包含 Element 的集合</span>
<span class="hljs-keyword">interface</span> JQuery&lt;TElement <span class="hljs-keyword">extends</span> Node = HTMLElement&gt; <span class="hljs-keyword">extends</span> Iterable&lt;TElement&gt; {
    length: <span class="hljs-built_in">number</span>;
    eq(index: <span class="hljs-built_in">number</span>): <span class="hljs-keyword">this</span>;

    <span class="hljs-comment">// 重载</span>
    add(selector: JQuery.Selector, context: Element): <span class="hljs-keyword">this</span>;
    add(selector: JQuery.Selector | JQuery.TypeOrArray&lt;Element&gt; | JQuery.htmlString | JQuery): <span class="hljs-keyword">this</span>;

    children(selector?: JQuery.Selector): <span class="hljs-keyword">this</span>;
    css(propertyName: <span class="hljs-built_in">string</span>): <span class="hljs-built_in">string</span>;
    html(): <span class="hljs-built_in">string</span>;
}

<span class="hljs-comment">// 对模块 jquery 输出接口</span>
<span class="hljs-keyword">declare</span> <span class="hljs-keyword">module</span> 'jquery' {
    <span class="hljs-comment">// module 中要使用 export = 而不是 export default</span>
    <span class="hljs-keyword">export</span> = jQuery;
}</code></pre><h2 id="类型定义"><a class="fa fa-link hash" aria-hidden="true" href="#类型定义" name="类型定义"></a><span>类型定义</span></h2><p><code>*.d.ts</code> 编写起来非常简单，经过 TypeScript 良好的静态类型系统洗礼过后，语法学习成本非常低。</p>
<p>我们可以使用 <code>type</code> 用来定义类型变量：</p>
<pre class="hljs"><code class="typescript"><span class="hljs-comment">// 基本类型</span>
<span class="hljs-keyword">type</span> UserName = <span class="hljs-built_in">string</span>

<span class="hljs-comment">// 类型赋值</span>
<span class="hljs-keyword">type</span> WebSite = <span class="hljs-built_in">string</span>
<span class="hljs-keyword">type</span> Tsaid = WebSite</code></pre><p>可以看到 <code>type</code> 其实可以定义各种格式的类型，也可以和其他类型进行组合。</p>
<pre class="hljs"><code class="typescript"><span class="hljs-comment">// 对象</span>
<span class="hljs-keyword">type</span> User = {
  name: <span class="hljs-built_in">string</span>;
  age: <span class="hljs-built_in">number</span>;
  website: WebSite;
}

<span class="hljs-comment">// 方法</span>
<span class="hljs-keyword">type</span> say = <span class="hljs-function">(<span class="hljs-params">age: <span class="hljs-built_in">number</span></span>) =&gt;</span> <span class="hljs-built_in">string</span>

<span class="hljs-comment">// 类</span>
<span class="hljs-keyword">class</span> TaSaid {
  website: <span class="hljs-built_in">string</span>;
  say: <span class="hljs-function">(<span class="hljs-params">age: <span class="hljs-built_in">number</span></span>) =&gt;</span> <span class="hljs-built_in">string</span>;
}</code></pre><p>当然，我们也可以使用 <code>interface</code> 定义我们的复杂类型，在 TS 中我们也可以直接定义 <code>interface</code>：</p>
<pre class="hljs"><code class="typescript"><span class="hljs-keyword">interface</span> Application {
    init(): <span class="hljs-built_in">void</span>
    <span class="hljs-keyword">get</span>(key: <span class="hljs-built_in">string</span>): object
}</code></pre><p><code>interface</code> 和 <code>type</code>(或者说 <code>class</code>) 很像。</p>
<p>但是 <code>type</code> 的含义是定义自定义类型，当 TS 提供给你的基础类型都不满足的时候，可以使用 <code>type</code> 自由组合出你的新类型，而 <code>interface</code> 应该是对外输出的接口。</p>
<p><code>type</code> 不可以被继承，但 <code>interface</code> 可以：</p>
<pre class="hljs"><code class="typescript"><span class="hljs-keyword">interface</span> BaseApplication {
    appId: <span class="hljs-built_in">number</span>
}

<span class="hljs-keyword">export</span> <span class="hljs-keyword">interface</span> Application <span class="hljs-keyword">extends</span> BaseApplication {
  init(): <span class="hljs-built_in">void</span>
    <span class="hljs-keyword">get</span>(key: <span class="hljs-built_in">string</span>): object
}</code></pre><h2 id="declare"><a class="fa fa-link hash" aria-hidden="true" href="#declare" name="declare"></a><span>declare</span></h2><p><code>declare</code> 可以创建 <code>*.d.ts</code> 文件中的变量，<code>declare</code> 只能作用域最外层：</p>
<pre class="hljs"><code class="typescript"><span class="hljs-keyword">declare</span> <span class="hljs-keyword">var</span> foo: <span class="hljs-built_in">number</span>;
<span class="hljs-keyword">declare</span> <span class="hljs-function"><span class="hljs-keyword">function</span> <span class="hljs-title">greet</span>(<span class="hljs-params">greeting: <span class="hljs-built_in">string</span></span>): <span class="hljs-title">void</span></span>;

<span class="hljs-keyword">declare</span> <span class="hljs-keyword">namespace</span> tasaid {
  <span class="hljs-comment">// 这里不能 declare</span>
  <span class="hljs-keyword">interface</span> blog {
    website: <span class="hljs-string">'http://tasaid.com'</span>
  } 
}</code></pre><p>基本上顶层的定义都需要使用 <code>declare</code>， <code>class</code> 也是：</p>
<pre class="hljs"><code class="typescript"><span class="hljs-keyword">declare</span> <span class="hljs-keyword">class</span> User {
  name: <span class="hljs-built_in">string</span>
}</code></pre><h2 id="namespace"><a class="fa fa-link hash" aria-hidden="true" href="#namespace" name="namespace"></a><span>namespace</span></h2><p>为防止类型重复，使用 <code>namespace</code> 用于划分区域块，分离重复的类型，顶层的 <code>namespace</code> 需要 <code>declare</code> 输出到外部环境，子命名空间不需要 <code>declare</code>。</p>
<pre class="hljs"><code class="typescript"><span class="hljs-comment">// 命名空间</span>
<span class="hljs-keyword">declare</span> <span class="hljs-keyword">namespace</span> Models {
  <span class="hljs-keyword">type</span> A = <span class="hljs-built_in">number</span>
  <span class="hljs-comment">// 子命名空间</span>
  <span class="hljs-keyword">namespace</span> Config {
    <span class="hljs-keyword">type</span> A = object
    <span class="hljs-keyword">type</span> B = <span class="hljs-built_in">string</span>
  }
}

<span class="hljs-keyword">type</span> C = Models.Config.A</code></pre><h2 id="组合定义"><a class="fa fa-link hash" aria-hidden="true" href="#组合定义" name="组合定义"></a><span>组合定义</span></h2><p>上面我们只演示了一些简单的类型组合，生产环境中会包含许多复杂的类型定义，这时候我们就需要各种组合出强大的类型定义：</p>
<h3 id="动态属性"><a class="fa fa-link hash" aria-hidden="true" href="#动态属性" name="动态属性"></a><span>动态属性</span></h3><p>有些类型的属性名是动态而未知的，例如：</p>
<pre class="hljs"><code class="javascript">{
  <span class="hljs-string">'10086'</span>: {
    <span class="hljs-attr">name</span>: <span class="hljs-string">'中国移动'</span>,
    <span class="hljs-attr">website</span>: <span class="hljs-string">'http://www.10086.cn'</span>,
  },
  <span class="hljs-string">'10010'</span>: {
    <span class="hljs-attr">name</span>: <span class="hljs-string">'中国联通'</span>,
    <span class="hljs-attr">website</span>: <span class="hljs-string">'http://www.10010.com'</span>,
  },
  <span class="hljs-string">'10000'</span>: {
    <span class="hljs-attr">name</span>: <span class="hljs-string">'中国电信'</span>,
    <span class="hljs-attr">website</span>: <span class="hljs-string">'http://www.189.cn'</span>
  }
}</code></pre><p>我们可以使用动态属性名来定义类型：</p>
<pre class="hljs"><code class="typescript"><span class="hljs-keyword">interface</span> ChinaMobile {
  name: <span class="hljs-built_in">string</span>;
  website: <span class="hljs-built_in">string</span>;
}

<span class="hljs-keyword">interface</span> ChinaMobileList {
  <span class="hljs-comment">// 动态属性</span>
  [phone: <span class="hljs-built_in">string</span>]: ChinaMobile
}</code></pre><h3 id="类型遍历"><a class="fa fa-link hash" aria-hidden="true" href="#类型遍历" name="类型遍历"></a><span>类型遍历</span></h3><p>当你已知某个类型范围的时候，可以使用 <code>in</code> 和 <code>keyof</code> 来遍历类型，例如上面的 ChinaMobile 例子，我们可以使用 <code>in</code> 来约束属性名必须为三家运营商之一：</p>
<pre class="hljs"><code class="typescript"><span class="hljs-keyword">type</span> ChinaMobilePhones = <span class="hljs-string">'10086'</span> | <span class="hljs-string">'10010'</span> | <span class="hljs-string">'10000'</span>

<span class="hljs-keyword">interface</span> ChinaMobile {
  name: <span class="hljs-built_in">string</span>;
  website: <span class="hljs-built_in">string</span>;
}

<span class="hljs-comment">// 只能 type 使用， interface 无法使用</span>
<span class="hljs-keyword">type</span> ChinaMobileList = {
  <span class="hljs-comment">// 遍历属性</span>
  [phone <span class="hljs-keyword">in</span> ChinaMobilePhones]: ChinaMobile
}</code></pre><p>我们也可以用 <code>keyof</code> 来约定方法的参数</p>
<pre class="hljs"><code class="typescript">
<span class="hljs-keyword">export</span> <span class="hljs-keyword">type</span> keys = {
  name: <span class="hljs-built_in">string</span>;
  appId: <span class="hljs-built_in">number</span>;
  config: object;
}

<span class="hljs-keyword">class</span> Application {
  <span class="hljs-comment">// 参数和值约束范围</span>
  <span class="hljs-keyword">set</span>&lt;T <span class="hljs-keyword">extends</span> keyof keys&gt;(key: T, val: keys[T])
  <span class="hljs-keyword">get</span>&lt;T <span class="hljs-keyword">extends</span> keyof keys&gt;(key: T): keys[T]
}</code></pre><p><img src="//s1.ax1x.com/2018/02/11/9Gh3TJ.png" alt=""></p>
<h2 id="集成发布"><a class="fa fa-link hash" aria-hidden="true" href="#集成发布" name="集成发布"></a><span>集成发布</span></h2><p>有两种主要方式用来发布类型定义文件到 <code>npm</code>：</p>
<ol>
<li>与你的 npm 包捆绑在一起(内置类型定义文件)</li>
<li>发布到 npm 上的 <a href="//tasaid.com/home/cv?url=https%3A%2F%2Fwww.npmjs.com%2F~types" title="null" target="_blank">@types organization</a></li>
</ol>
<p>前者，安装完了包之后会自动检测并识别类型定义文件。
后者，则需要通过 <code>npm i @types/xxxx</code> 安装，这就是我们前面所说的 <a href="//tasaid.com/home/cv?url=https%3A%2F%2Fgithub.com%2FDefinitelyTyped%2FDefinitelyTyped" title="null" target="_blank">DefinitelyTyped</a> ，用于扩展 JS 库的类型声明。</p>
<h3 id="内置类型定义文件"><a class="fa fa-link hash" aria-hidden="true" href="#内置类型定义文件" name="内置类型定义文件"></a><span>内置类型定义文件</span></h3><p>内置类型定义就是把你的类型定义文件和 npm 包一起发布，一般来说，类型定义文件都放在包根目录的 <code>types</code> 目录里，例如 <a href="//tasaid.com/home/cv?url=https%3A%2F%2Fgithub.com%2Fvuejs%2Fvue%2Ftree%2Fv2.5.2%2Ftypes" title="null" target="_blank">vue</a>：</p>
<p>如果你的包有一个主 <code>.js</code> 文件，需要在 <code>package.json</code> 里指定主类型定义文件。</p>
<p>设置 <code>types</code> 或 <code>typeings</code> 属性指向捆绑在一起的类型定义文件。 例如包目录如下：</p>
<pre class="hljs"><code class="bash">├── lib
│   ├── main.js
│   └── main.d.ts <span class="hljs-comment"># 类型定义文件</span>
└── package.json</code></pre><pre class="hljs"><code class="javascript"><span class="hljs-comment">// pageage.json</span>
{
    <span class="hljs-string">"name"</span>: <span class="hljs-string">"demo"</span>,
    <span class="hljs-string">"author"</span>: <span class="hljs-string">"demo project"</span>,
    <span class="hljs-string">"version"</span>: <span class="hljs-string">"1.0.0"</span>,
    <span class="hljs-string">"main"</span>: <span class="hljs-string">"./lib/main.js"</span>,
    <span class="hljs-comment">// 定义主类型定义文件</span>
    <span class="hljs-string">"types"</span>: <span class="hljs-string">"./lib/main.d.ts"</span>
}</code></pre><p>如果主类型定义文件名是 <code>index.d.ts</code> 并且位置在包的根目录里，就不需要使用 <code>types</code> 属性指定了。</p>
<pre class="hljs"><code class="bash">├── lib
│   └── main.js
├── index.d.ts <span class="hljs-comment"># 类型定义文件</span>
└── package.json</code></pre><p>如果你发的包中，<code>package.json</code> 中使用了 <code>files</code> 字段的话（<code>npm</code> 会根据 <code>files</code> 配置的规则决定发布哪些文件），则需要手动把类型定义文件加入：</p>
<pre class="hljs"><code class="javascript"><span class="hljs-comment">// pageage.json</span>
{
  <span class="hljs-string">"files"</span>: [
    <span class="hljs-string">"index.js"</span>,
    <span class="hljs-string">"*.d.ts"</span>
  ]
}</code></pre><p>如果只发二级目录的话，把类型定义文件放到对应的二级目录下即可：</p>
<pre class="hljs"><code class="typescript"><span class="hljs-keyword">import</span> { <span class="hljs-keyword">default</span> <span class="hljs-keyword">as</span> App } <span class="hljs-keyword">from</span> <span class="hljs-string">'demo/app'</span></code></pre><h3 id="发布到 @types organizatio"><a class="fa fa-link hash" aria-hidden="true" href="#发布到 @types organizatio" name="发布到 @types organizatio"></a><span>发布到 @types organizatio</span></h3><p>发布到 <code>@types organizatio</code> 的包表示源包没有包含类型定义文件，第三方/或原作者定义好类型定义文件之后，发布到 <a href="//tasaid.com/home/cv?url=https%3A%2F%2Fwww.npmjs.com%2F~types" title="null" target="_blank">@types</a> 中。例如 <a href="//tasaid.com/home/cv?url=https%3A%2F%2Fwww.npmjs.com%2Fpackage%2F%40types%2Fexpress" title="null" target="_blank">@types/express</a>。</p>
<p>根据 <code>DefinitelyTyped</code> 的规则，和编辑器(和插件) 自动检测静态类型。</p>
<p><a href="//tasaid.com/home/cv?url=https%3A%2F%2Fwww.npmjs.com%2F~types" title="null" target="_blank">@types</a> 下面的包是从 <a href="//tasaid.com/home/cv?url=https%3A%2F%2Fgithub.com%2FDefinitelyTyped%2FDefinitelyTyped" title="null" target="_blank">DefinitelyTyped</a> 里自动发布的，通过 <a href="//tasaid.com/home/cv?url=https%3A%2F%2Fgithub.com%2FMicrosoft%2Ftypes-publisher" title="null" target="_blank">types-publisher</a> 工具。 </p>
<p>如果想让你的包发布为 @types 包，需要提交一个 pull request 到 <a href="//tasaid.com/home/cv?url=https%3A%2F%2Fgithub.com%2FDefinitelyTyped%2FDefinitelyTyped" title="null" target="_blank">https://github.com/DefinitelyTyped/DefinitelyTyped</a>。 </p>
<p>在这里查看详细信息 <a href="//tasaid.com/home/cv?url=http%3A%2F%2Fdefinitelytyped.org%2Fguides%2Fcontributing.html" title="null" target="_blank">contribution guidelines page</a>。</p>
<p>如果你正在使用 TypeScript，而使用了一些 JS 包并没有对应的类型定义文件，可以编写一份然后提交到 <code>@types</code>。</p>
<p>赠人玫瑰，手留余香。</p>
<p>发布到 <code>@types organizatio</code> 的包可以通过 <a href="//tasaid.com/home/cv?url=https%3A%2F%2Fmicrosoft.github.io%2FTypeSearch%2F" title="null" target="_blank">TypeSearch</a> 搜索检索，使用 <code>npm install --save-dev @types/xxxx</code> 安装：</p>
<p><img src="//s1.ax1x.com/2018/02/11/9GhNSx.png" alt=""></p>
<p>更多细节请参阅 <a href="//tasaid.com/home/cv?url=https%3A%2F%2Fgithub.com%2FDefinitelyTyped%2FDefinitelyTyped" title="null" target="_blank">DefinitelyTyped</a>。</p>
<h2 id="其他"><a class="fa fa-link hash" aria-hidden="true" href="#其他" name="其他"></a><span>其他</span></h2><h3 id="module"><a class="fa fa-link hash" aria-hidden="true" href="#module" name="module"></a><span>module</span></h3><p>通常来说，如果这份类型定义文件是 JS 库自带的，那么我们可以直接导出模块：</p>
<pre class="hljs"><code class="typescript"><span class="hljs-keyword">interface</span> User {}
<span class="hljs-keyword">export</span> = User</code></pre><p>而如果这份类型定义文件不是 JS 库自带的，而是第三方的，则需要使用 <code>module</code> 进行关联。</p>
<p>例如 <code>jquery</code> 发布的 npm 包中不包含 <code>*.d.ts</code> 类型定义文件，<code>jquery</code> 的类型定义文件发布在了 <code>@types/jquery</code>，所以类型定义文件中导出类型的时候，需要关联模块 <code>jquery</code>，意思就是我专门针对这个包做的类型定义：</p>
<pre class="hljs"><code class="typescript"><span class="hljs-keyword">interface</span> jQuery {}
<span class="hljs-keyword">declare</span> <span class="hljs-keyword">module</span> 'jquery' {
    <span class="hljs-comment">// module 中要使用 export = 而不是 export default</span>
    <span class="hljs-keyword">export</span> = jQuery;
}</code></pre><p>从而解决了一些主流的 JS 库发布的 <code>npm</code> 包中没有类型定义文件，但是我们可以用第三方类型定义文件为这些库补充类型。</p>
<h3 id="风格"><a class="fa fa-link hash" aria-hidden="true" href="#风格" name="风格"></a><span>风格</span></h3><p>经过一系列探索，个人比较推荐下面的编写风格，先看目录：</p>
<pre class="hljs"><code class="bash">types
├── application.d.ts
├── config.d.ts
├── index.d.ts <span class="hljs-comment"># 入口模块</span>
└── user.d.ts</code></pre><p><img src="//s1.ax1x.com/2018/02/11/9GhUl6.png" alt=""></p>
<p>入口模块主要做这些事情：</p>
<ol>
<li>定义命名空间</li>
<li>导出和聚合子模块</li>
</ol>
<p>主出口文件 <code>index.d.ts</code>：</p>
<pre class="hljs"><code class="typescript"><span class="hljs-keyword">import</span> * <span class="hljs-keyword">as</span> UserModel <span class="hljs-keyword">from</span> <span class="hljs-string">'./user'</span>
<span class="hljs-keyword">import</span> * <span class="hljs-keyword">as</span> AppModel <span class="hljs-keyword">from</span> <span class="hljs-string">'./application'</span>
<span class="hljs-keyword">import</span> * <span class="hljs-keyword">as</span> ConfigModel <span class="hljs-keyword">from</span> <span class="hljs-string">'./config'</span>

<span class="hljs-keyword">declare</span> <span class="hljs-keyword">namespace</span> Models {
  <span class="hljs-keyword">export</span> <span class="hljs-keyword">type</span> User = UserModel.User;
  <span class="hljs-keyword">export</span> <span class="hljs-keyword">type</span> Application = AppModel.Application;
  <span class="hljs-comment">// 利用 as 抹平争议性变量名</span>
  <span class="hljs-keyword">export</span> <span class="hljs-keyword">type</span> Config = ConfigModel.Config;
}</code></pre><p>子模块无需定义命名空间，这样外部环境 (<code>types</code> 文件夹之外) 则无法获取子模块类型，达到了类型封闭的效果：</p>
<pre class="hljs"><code class="typescript"><span class="hljs-keyword">export</span> <span class="hljs-keyword">interface</span> User {
  name: <span class="hljs-built_in">string</span>;
  age: <span class="hljs-built_in">number</span>
}</code></pre>
<blockquote>
<ul>
    <li><a href="http://es6.ruanyifeng.com/#docs/promise">ECMAScript 6 入门 - Promise对象</a></li>
    <li><a href="http://www.ituring.com.cn/article/66566#">Promise/A+规范</a></li>
    <li><a href="http://www.cnblogs.com/rubylouvre/p/3658441.html">JavaScript框架设计-第12章 异步处理</a></li>
    <li><a href="https://www.dmfeel.com/post/536799f91f1bf49646000001">Promise启示录</a></li>
</ul>
</blockquote>`