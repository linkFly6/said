using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using System.Web.Optimization;

namespace Said.Models
{
    /// <summary>
    /// 扩展Said HTML
    /// </summary>
    public static class SaidHtmlHelperExtensions
    {
        /// <summary>
        /// 输出内联CSS（通过Bundle压缩）
        /// </summary>
        /// <param name="htmlHelper"></param>
        /// <param name="bundleVirtualPath"></param>
        /// <returns></returns>
        public static IHtmlString InlineStyles(this HtmlHelper htmlHelper, string bundleVirtualPath)
        {
            string bundleContent = LoadBundleContent(htmlHelper.ViewContext.HttpContext, bundleVirtualPath);
            string htmlTag = string.Format("<style>{0}</style>", bundleContent);
            return new HtmlString(htmlTag);
        }


        /// <summary>
        /// 输出内联JS（通过Bundle压缩）
        /// </summary>
        /// <param name="htmlHelper"></param>
        /// <param name="bundleVirtualPath"></param>
        /// <returns></returns>
        public static IHtmlString InlineScripts(this HtmlHelper htmlHelper, string bundleVirtualPath)
        {
            string bundleContent = LoadBundleContent(htmlHelper.ViewContext.HttpContext, bundleVirtualPath);
            string htmlTag = string.Format("<script type=\"text/javascript\">{0}</script>", bundleContent);
            return new HtmlString(htmlTag);
        }

        private static string LoadBundleContent(HttpContextBase httpContext, string bundleVirtualPath)
        {
            var bundleContext = new BundleContext(httpContext, BundleTable.Bundles, bundleVirtualPath);
            var bundle = BundleTable.Bundles.Single(b => b.Path == bundleVirtualPath);
            var bundleResponse = bundle.GenerateBundleResponse(bundleContext);
            return bundleResponse.Content;
        }
    }
}