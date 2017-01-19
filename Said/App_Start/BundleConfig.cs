using System.Web;
using System.Web.Optimization;

namespace Said
{
    public class BundleConfig
    {
        // 有关 Bundling 的详细信息，请访问 http://go.microsoft.com/fwlink/?LinkId=254725
        public static void RegisterBundles(BundleCollection bundles)
        {
            #region 全站通用CSS

            #endregion

            #region JS插件
            //avalon插件
            bundles.Add(new ScriptBundle("~/static/w/a/gi.js").Include("~/Content/widget/avalon/groupInput.js"));
            bundles.Add(new ScriptBundle("~/static/w/a/popup.js").Include("~/Content/widget/avalon/popup.js"));
            bundles.Add(new ScriptBundle("~/static/w/a/ub.js").Include("~/Content/widget/avalon/uploadBox.js"));

            //bootstrap
            bundles.Add(new ScriptBundle("~/static/w/bs/bootstrap.js").Include("~/Content/widget/bootstrap/bootstrap.js"));
            bundles.Add(new ScriptBundle("~/static/w/bs/date.js").Include("~/Content/widget/bootstrap/bootstrap-datetimepicker/bootstrap-datetimepicker.js"));
            bundles.Add(new ScriptBundle("~/static/w/bs/table.js").Include("~/Content/widget/bootstrap/bootstrap-table/bootstrap-table.js"));

            //highlight
            bundles.Add(new ScriptBundle("~/static/w/hl/highlight.js").Include("~/Content/widget/highlight/highlight.said.js"));

            //so
            bundles.Add(new ScriptBundle("~/static/w/so/so.js").Include("~/Content/widget/so/so.js"));
            bundles.Add(new ScriptBundle("~/static/w/so/dialog.js").Include("~/Content/widget/so/plug/dialog.js"));
            bundles.Add(new ScriptBundle("~/static/w/so/search.js").Include("~/Content/widget/so/plug/search.js"));
            bundles.Add(new ScriptBundle("~/static/w/so/source.js").Include("~/Content/widget/so/plug/source.js"));
            bundles.Add(new ScriptBundle("~/static/w/so/upload.js").Include("~/Content/widget/so/plug/upload.js"));

            //sweetalert
            bundles.Add(new ScriptBundle("~/static/w/sweetalert.js").Include("~/Content/widget/sweetalert/sweetalert.min.js"));

            //echarts
            bundles.Add(new ScriptBundle("~/static/w/echarts.js").Include("~/Content/widget/echarts.js"));

            //showdown
            bundles.Add(new ScriptBundle("~/static/w/showdown.js").Include("~/Content/widget/showdown.said.js"));

            //underscore
            bundles.Add(new ScriptBundle("~/static/w/underscore.js").Include("~/Content/widget/underscore.js"));

            //requirejs
            bundles.Add(new ScriptBundle("~/static/w/requirejs.js").Include("~/Content/widget/requirejs-2.1.15.js"));

            //underscore
            bundles.Add(new ScriptBundle("~/static/w/jquery.js").Include("~/Content/widget/jquery-2.1.1.js"));

            #endregion


            #region 后台CSS
            //全局样式
            bundles.Add(new StyleBundle("~/static/back/css/global.css")
                   .Include(
                        "~/Content/widget/bootstrap/bootstrap.css",
                        "~/Content/Style/font-awesome.min.css",
                        "~/Content/Back/Style/default.css",
                        "~/Content/widget/sweetalert/sweetalert.css"));


            #region 插件样式
            bundles.Add(new StyleBundle("~/static/back/css/bootstrap-table.css").Include("~/Content/widget/bootstrap/bootstrap-table/bootstrap-table.css"));
            bundles.Add(new StyleBundle("~/static/back/css/bootstrap-date.css").Include("~/Content/widget/bootstrap/bootstrap-datetimepicker/bootstrap-datetimepicker.css"));
            #endregion


            #region 业务相关
            //通用资源显示样式
            bundles.Add(new StyleBundle("~/static/back/css/saidCenter.css").Include("~/Content/back/Style/saidCenter.css"));

            //新增blog/said
            bundles.Add(new StyleBundle("~/static/back/css/said.add.css").Include("~/Content/back/Style/addSaid.css"));

            //分类
            bundles.Add(new StyleBundle("~/static/back/css/classify.css").Include("~/Content/back/Style/classify.css"));

            //首页
            bundles.Add(new StyleBundle("~/static/back/css/home.css").Include("~/Content/back/Style/index.css"));

            //登录
            bundles.Add(new StyleBundle("~/static/back/css/login.css")
                   .Include(
                        "~/Content/Style/Global.css",
                        "~/Content/Back/Style/login.css"));

            //图片和资源通用样式
            bundles.Add(new StyleBundle("~/static/back/css/image.index.css").Include("~/Content/back/Style/imagesCenter.css"));

            //页面配置
            bundles.Add(new StyleBundle("~/static/back/css/pageconfig.css").Include("~/Content/back/Style/pageConfig.css"));

            

            //站点日志
            bundles.Add(new StyleBundle("~/static/back/css/home.sitelog.css").Include("~/Content/back/Style/home.sitelog.css"));

            #endregion

            //
            //bundles.Add(new StyleBundle("~/static/back/css/").Include(""));

            #endregion


            #region 后台业务JS

            //require配置
            bundles.Add(new ScriptBundle("~/static/back/js/config.js").Include("~/Content/back/javaScript/require.config.js"));

            //全站后台通用js
            bundles.Add(new ScriptBundle("~/static/back/js/global.js").Include(
                    "~/Content/widget/jquery-2.1.1.js",
                    "~/Content/widget/so/so.js",
                    "~/Content/widget/avalon/avalon.mobile.js",
                    "~/Content/back/javaScript/global.js",
                    "~/Content/widget/bootstrap/bootstrap.js"));

            #region 业务相关
            //新增blog
            bundles.Add(new ScriptBundle("~/static/back/js/blog.add.js").Include("~/Content/back/javaScript/blog.add.js"));
            //编辑blog
            bundles.Add(new ScriptBundle("~/static/back/js/blog.edit.js").Include("~/Content/back/javaScript/blog.edit.js"));
            //blog列表
            bundles.Add(new ScriptBundle("~/static/back/js/blog.index.js").Include("~/Content/back/javaScript/blog.index.js"));
            //预览blog
            bundles.Add(new ScriptBundle("~/static/back/js/blog.preview.js").Include("~/Content/back/javaScript/blog.preview.js"));

            //分类
            bundles.Add(new ScriptBundle("~/static/back/js/classify.index.js").Include("~/Content/back/javaScript/classify.index.js"));

            //登录
            bundles.Add(new ScriptBundle("~/static/back/js/home.login.js").Include("~/Content/back/javaScript/home.login.js"));

            //图片资源
            bundles.Add(new ScriptBundle("~/static/back/js/image.index.js").Include("~/Content/back/javaScript/image.index.js"));


            //音乐资源
            bundles.Add(new ScriptBundle("~/static/back/js/music.index.js").Include("~/Content/back/javaScript/music.index.js"));


            //新增Said
            bundles.Add(new ScriptBundle("~/static/back/js/said.add.js").Include("~/Content/back/javaScript/said.add.js"));
            //编辑said
            bundles.Add(new ScriptBundle("~/static/back/js/said.edit.js").Include("~/Content/back/javaScript/said.edit.js"));
            //Said列表
            bundles.Add(new ScriptBundle("~/static/back/js/said.index.js").Include("~/Content/back/javaScript/said.index.js"));


            //页面配置
            bundles.Add(new ScriptBundle("~/static/back/js/home.config.js").Include("~/Content/back/javaScript/home.config.js"));


            //站点配置
            bundles.Add(new ScriptBundle("~/static/back/js/home.siterecord.js").Include("~/Content/back/javaScript/home.siterecord.js"));

            //站点日志
            bundles.Add(new ScriptBundle("~/static/back/js/home.sitelog.js").Include("~/Content/back/javaScript/home.sitelog.js"));
            #endregion


            #endregion


            #region 前台CSS
            //全局样式
            bundles.Add(new StyleBundle("~/static/said/css/global.css")
                   .Include(
                        "~/Content/style/Global.css",
                        "~/Content/Style/font-awesome.min.css",
                        "~/Content/Style/layout.css"));

            //blog
            bundles.Add(new StyleBundle("~/static/said/blog.css").Include("~/Content/Style/blog.css", "~/Content/widget/highlight/github.css"));
            bundles.Add(new StyleBundle("~/static/said/blog.index.css").Include("~/Content/Style/bloglist.css"));

            //Home
            bundles.Add(new StyleBundle("~/static/said/home.about.css").Include("~/Content/Style/about.css"));
            bundles.Add(new StyleBundle("~/static/said/index.css").Include("~/Content/Style/index.css"));
            bundles.Add(new StyleBundle("~/static/said/error.css").Include("~/Content/Style/notFound.css"));

            //project
            bundles.Add(new StyleBundle("~/static/said/projects.css").Include("~/Content/Style/projects.css"));
            bundles.Add(new StyleBundle("~/static/said/.css").Include("~/Content/Style/.css"));


            //said
            bundles.Add(new StyleBundle("~/static/said/article.css").Include("~/Content/Style/saiddetail.css"));
            bundles.Add(new StyleBundle("~/static/said/article.index.css").Include("~/Content/Style/saidlist.css"));


            //bundles.Add(new StyleBundle("~/static/said/.css").Include("~/Content/Style/.css"));

            #endregion

            #region 前台JS
            //require配置
            bundles.Add(new ScriptBundle("~/static/said/config.js").Include("~/Content/javascript/require.config.js"));
            //全局
            bundles.Add(new ScriptBundle("~/static/said/main.js").Include("~/Content/widget/jquery-2.1.1.js", "~/Content/javaScript/global.js"));

            //blog业务
            bundles.Add(new ScriptBundle("~/static/said/blog.js").Include("~/Content/javascript/blog.js"));
            bundles.Add(new ScriptBundle("~/static/said/blog.index.js").Include("~/Content/javascript/blog.index.js"));

            //home
            bundles.Add(new ScriptBundle("~/static/said/home.index.js").Include("~/Content/javascript/home.index.js"));

            //said
            bundles.Add(new ScriptBundle("~/static/said/article.js").Include("~/Content/javascript/article.js"));

            //
            //bundles.Add(new ScriptBundle("~/static/said/.js").Include("~/Content/javascript/.js"));
            #endregion



            #region WapCSS
            //全局样式
            bundles.Add(new StyleBundle("~/static/wap/css/global.css")
                   .Include(
                        "~/Content/wap/style/layout.css",
                        "~/Content/Style/font-awesome.min.css"));

            //blog
            bundles.Add(new StyleBundle("~/static/wap/about.css").Include("~/Content/wap/style/about.css"));

            //Said
            bundles.Add(new StyleBundle("~/static/wap/article.css").Include("~/Content/wap/style/article.css"));

            //blog
            bundles.Add(new StyleBundle("~/static/wap/github.css").Include("~/Content/widget/highlight/github.css"));

            #endregion

            #region WapJS
            bundles.Add(new ScriptBundle("~/static/wap/global.js").Include(
                "~/Content/widget/jquery-2.1.1.js",
                "~/Content/wap/javascript/global.js"
                ));

            //require配置
            bundles.Add(new ScriptBundle("~/static/wap/config.js").Include("~/Content/wap/javascript/require.config.js"));

            //首页
            bundles.Add(new ScriptBundle("~/static/wap/index.js").Include("~/Content/wap/javascript/index.js"));

            //said
            bundles.Add(new ScriptBundle("~/static/wap/article.js").Include("~/Content/wap/javascript/article.js"));
            bundles.Add(new ScriptBundle("~/static/wap/article.index.js").Include("~/Content/wap/javascript/article.index.js"));


            //blog
            bundles.Add(new ScriptBundle("~/static/wap/blog.index.js").Include("~/Content/wap/javascript/blog.index.js"));


            #endregion
        }
    }
}