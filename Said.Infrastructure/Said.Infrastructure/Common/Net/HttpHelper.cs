using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net;
using System.Text;
using System.Text.RegularExpressions;
using System.Threading.Tasks;

namespace Said.Helper
{
    public class HttpHelper
    {
        private static readonly string IPQUERYAPIBYSINA = "http://int.dpool.sina.com.cn/iplookup/iplookup.php?ip={0}";
        private System.Web.HttpContext Context;
        //private static readonly string UA = "HTTP_USER_AGENT";//Context.Request.ServerVariables[UA]
        public HttpHelper()
        {
            this.Context = System.Web.HttpContext.Current;
        }

        public HttpHelper(System.Web.HttpContext context)
        {
            this.Context = context;
        }

        #region 实例方法
        /// <summary>
        /// 获取当前访问用户的IP地址（穿透代理）
        /// </summary>
        /// <returns></returns>
        public string GetIP()
        {
            return GetIP(this.Context);
        }

        /// <summary>
        /// 将获得的ip地址换算成数字字符串
        /// </summary>
        /// <returns></returns>
        public string GetClientIPdata()
        {
            return GetClientIPdata(this.Context);
        }
        /// <summary>
        /// 判断爬虫名称，不是则返回为空字符串
        /// </summary>
        /// <returns></returns>
        public string GetSpiderBot()
        {
            return GetSpiderBot(this.Context.Request.UserAgent);
        }
        /// <summary>
        /// 获取客户端语言
        /// </summary>
        /// <returns></returns>
        public string GetLangage()
        {
            return GetLangage(this.Context);
        }
        /// <summary>
        /// 获取系统
        /// </summary>
        /// <returns></returns>
        public string GetClientOS()
        {
            return GetClientOS(this.Context.Request.UserAgent);
        }

        public string GetBrowser()
        {
            return GetBrowser(this.Context.Request.UserAgent);
        }

        #endregion


        #region 静态方法

        #region 根据IP地址获取当前用户的地理位置
        public static string GetAddress(string ip)
        {
            string result = string.Empty;
            string[] res = null;
            if (IsIPAddress(ip))
            {
                result = ReadWebAPI(string.Format(IPQUERYAPIBYSINA, ip), Encoding.GetEncoding("gbk"));
                if (string.IsNullOrEmpty(result) || result[0] != '1')
                {
                    //var test = HttpHelper.GetAddress("255.255.255.255");//标准：保留地址                           ipip返回：IPIP.NET-20150331--
                    //var test2 = HttpHelper.GetAddress("124.127.118.59");//标准：北京市 电信                        ipip返回：中国-北京-北京-
                    //var test3 = HttpHelper.GetAddress("055.255.255.255");//标准：美国 弗吉尼亚(美国陆军部队)       ipip返回：美国-美国--
                    //var test4 = HttpHelper.GetAddress("123.203.21.9");//标准：来自香港特别行政区                   ipip返回：中国-香港--
                    //var test5 = HttpHelper.GetAddress("123.204.21.9");//标准：台湾省                               ipip返回：中国-台湾--
                    //var test6 = HttpHelper.GetAddress("123.152.199.91");//标准：浙江省宁波市 联通                  ipip返回：中国-浙江-宁波-
                    //var test7 = HttpHelper.GetAddress("221.180.124.12");//标准：广西壮族自治区桂林市 移动          ipip返回：中国-广西-桂林-
                    res = IP.Find(ip);
                    if (res[0] == "IPIP.NET")
                        return string.Empty;
                    return string.Join("-", res);
                }
                else//进行sina API查询
                {
                    /*
                     *  sina API：
                        1 183.128.0.0 183.129.255.255 中国 浙江 杭州 电信或者 1 -1 -1 中国 浙江 杭州
                        第一个数字 1表示正常 -1表示内网，-2表示ip地址输入有误
                        第二和第三个字段 表示这一段内的ip都是对应相同的ip地址信息
                        第四个字段 表示所在国家
                        第五个字段 表示所在省
                        第六个字段 表示所在城市
                        第七个字段  表示网络所属运营商 
                     */
                    res = result.Split('\t');
                    if (res[0] == "-2")
                        return string.Empty;
                    //-2
                    //中国-北京-北京-
                    //美国-亚利桑那州-Fort Huachuca-
                    //中国-香港--
                    //中国-台湾--
                    //中国-浙江-宁波-
                    //中国-广西-桂林-
                    return res.Length > 4 ?
                        string.Format("{0}-{1}-{2}", res[3], res[4], res[5]) : string.Empty;
                }

            }
            return result;
        }
        #endregion


        #region 获取当前访问用户的IP地址
        /// <summary>
        /// 获取当前访问用户的IP地址
        /// 代码摘自：http://blog.csdn.net/lybwwp/article/details/42110523
        /// </summary>
        /// <param name="context">当前活跃的Http上下文对象</param>
        /// <returns></returns>
        public static string GetIP(System.Web.HttpContext context)
        {
            string result = context.Request.ServerVariables["HTTP_X_FORWARDED_FOR"];
            if (!string.IsNullOrWhiteSpace(result))//判断是否有代理
            {
                //没有"." 肯定是非IP格式  
                if (result.IndexOf(".") == -1)
                {
                    result = null;
                }
                else
                {
                    //有","，估计多个代理。取第一个不是内网的IP。  
                    if (result.IndexOf(",") != -1)
                    {
                        result = result.Replace(" ", string.Empty).Replace("\"", string.Empty);
                        string[] temparyip = result.Split(",;".ToCharArray());
                        if (temparyip != null && temparyip.Length > 0)
                        {
                            for (int i = 0; i < temparyip.Length; i++)
                            {
                                //找到不是内网的地址  
                                if (IsIPAddress(temparyip[i]) && temparyip[i].Substring(0, 3) != "10." && temparyip[i].Substring(0, 7) != "192.168" && temparyip[i].Substring(0, 7) != "172.16.")
                                {
                                    return temparyip[i];
                                }
                            }
                        }
                    }
                    //代理即是IP格式  
                    else if (IsIPAddress(result))
                    {
                        return result;
                    }
                    //代理中的内容非IP  
                    else
                    {
                        result = null;
                    }
                }
            }

            if (string.IsNullOrWhiteSpace(result))
            {
                result = context.Request.ServerVariables["REMOTE_ADDR"];
            }

            if (string.IsNullOrWhiteSpace(result))
            {
                result = context.Request.UserHostAddress;
            }
            return result;
        }
        #endregion

        #region 将获得的ip地址换算成数字字符串
        /// <summary>
        /// 将获得的ip地址换算成数字字符串
        /// <param name="context">当前活跃的Http上下文对象</param>
        /// </summary>
        public static string GetClientIPdata(System.Web.HttpContext context)
        {
            string result = GetIP(context);
            //return result;
            string[] ipdata = result.Split(new char[] { '.' });
            Double ipint;
            ipint = Convert.ToDouble(ipdata[0]) * 16777216 + Convert.ToDouble(ipdata[1]) * 65536 + Convert.ToDouble(ipdata[2]) * 256 + Convert.ToDouble(ipdata[3]);
            return Convert.ToString(ipint);
        }
        #endregion

        #region 访问互联网的Web API，并返回结果
        /// <summary>
        /// 访问互联网的Web API，并返回结果
        /// </summary>
        /// <param name="url">要访问的url</param>
        /// <returns>该API返回的结果</returns>
        public static string ReadWebAPI(string url, Encoding encode)
        {
            if (!url.Contains("http://") && !url.Contains("http://"))
                url = "http://" + url;
            if (UrlExistsUsingSockets(url))
            {
                WebRequest wreq = null;
                try
                {
                    wreq = WebRequest.Create(url);
                    wreq.Timeout = 1000;//超时时间
                    using (WebResponse wresp = (WebResponse)wreq.GetResponse())
                    {
                        Stream s = wresp.GetResponseStream();
                        StreamReader sr = new StreamReader(s, encode);
                        var result = sr.ReadToEnd();
                        return result;
                    }

                }
                catch (Exception e)
                {
                    System.Diagnostics.Trace.WriteLine(e);
                }
                finally
                {
                    if (wreq != null)
                        wreq.Abort();
                }
            }
            return string.Empty;
        }
        #endregion

        #region 检测远程URL是否存在
        /// <summary>
        /// 检测远程URL是否存在
        /// </summary>
        /// <param name="url"></param>
        /// <returns></returns>
        private static bool UrlExistsUsingSockets(string url)
        {
            if (url.StartsWith("http://")) url = url.Remove(0, "http://".Length);
            int index = url.IndexOf("/");
            if (index > 0) url = url.Remove(index);
            try
            {
                IPHostEntry ipHost = Dns.GetHostEntry(url); //GetHostEntry
                return true;
            }
            catch (System.Net.Sockets.SocketException se)
            {
                System.Diagnostics.Trace.Write(se.Message);
                return false;
            }
        }
        #endregion

        #region 判断一个字符串是不是IP地址
        /// <summary>
        /// 判断一个字符串是不是IP地址
        /// </summary>
        /// <param name="str"></param>
        /// <returns></returns>
        public static bool IsIPAddress(string str)
        {
            if (string.IsNullOrWhiteSpace(str) || str.Length < 7 || str.Length > 15)
                return false;
            string regformat = @"^(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})";
            Regex regex = new Regex(regformat, RegexOptions.IgnoreCase);
            return regex.IsMatch(str);
        }
        #endregion

        #region 判断爬虫名称，不是则返回为空字符串
        /// <summary>
        /// 判断爬虫名称，不是则返回为空字符串
        /// </summary>
        /// <param name="agent">user-agent</param>
        /// <returns></returns>
        public static string GetSpiderBot(string agent)
        {
            string spiderBot = string.Empty;
            if (string.IsNullOrEmpty(agent))
                return string.Empty;
            agent = agent.ToLower();
            //判断爬虫为谷歌，googlebot/2.1,googlebot-image/1.0,feedfetcher-google,
            //mediapartners-google,adsbot-google,googlebot-mobile/2.1,googlefriendconnect/1.0            
            if (agent.IndexOf("googlebot-image") > -1)
                spiderBot = "Google|Googlebot-Image";
            else if (agent.IndexOf("googlebot-mobile") > -1)
                spiderBot = "Google|Googlebot-Mobile";
            else if (agent.IndexOf("googlebot") > -1)
                spiderBot = "Google|Googlebot";
            else if (agent.IndexOf("feedfetcher-google") > -1)
                spiderBot = "Google|Feedfetcher-Google";
            else if (agent.IndexOf("mediapartners-google") > -1)
                spiderBot = "Google|Google Adsense";
            else if (agent.IndexOf("adsbot-google") > -1)
                spiderBot = "Google|Google AdWords";
            else if (agent.IndexOf("googlefriendconnect") > -1)
                spiderBot = "Google|GoogleFriendConnect";
            else if (agent.IndexOf("google") > -1)
                spiderBot = "Google|Google";
            //判断爬虫为雅虎 ；yahoo! slurp,yahoo! slurp/3.0,yahoo! slurp china,
            else if (agent.IndexOf("yahoo! slurp;") > -1)
                spiderBot = "Yahoo|Yahoo! Slurp";
            else if (agent.IndexOf("yahoo! slurp/3.0") > -1)
                spiderBot = "Yahoo|Yahoo! Slurp/3.0";
            else if (agent.IndexOf("yahoo! slurp china") > -1)
                spiderBot = "Yahoo|Yahoo! Slurp China";
            else if (agent.IndexOf("yahoofeedseeker/2.0") > -1)
                spiderBot = "Yahoo|YahooFeedSeeker/2.0";
            else if (agent.IndexOf("yahoo-blogs") > -1)
                spiderBot = "Yahoo|Yahoo Blogs";
            else if (agent.IndexOf("yahoo-mmcrawler") > -1)
                spiderBot = "Yahoo|Yahoo Image";
            else if (agent.IndexOf("yahoo contentmatch crawler") > -1)
                spiderBot = "Yahoo|Yahoo AD";
            else if (agent.IndexOf("yahoo") > -1)
                spiderBot = "Yahoo|Yahoo";
            //微软bing ,
            else if (agent.IndexOf("msnbot/1.1") > -1)
                spiderBot = "Bing|MSNbot/1.1";
            else if (agent.IndexOf("msnbot/2.0b") > -1)
                spiderBot = "Bing|MSNbot/2.0b";
            else if (agent.IndexOf("msrabot/2.0/1.0") > -1)
                spiderBot = "Bing|Msrabot/2.0/1.0";
            else if (agent.IndexOf("msnbot-media/1.0") > -1)
                spiderBot = "Bing|MSNbot-media/1.0";
            else if (agent.IndexOf("msnbot-products") > -1)
                spiderBot = "Bing|MSNBot-Products";
            else if (agent.IndexOf("msnbot-academic") > -1)
                spiderBot = "Bing|MSNBot-Academic";
            else if (agent.IndexOf("msnbot-newsblogs") > -1)
                spiderBot = "Bing|MSNBot-NewsBlogs";
            else if (agent.IndexOf("msnbot") > -1)
                spiderBot = "Bing|MSNBot";
            //百度；baiduspider,baiducustomer,baidu-thumbnail,
            //baiduspider-mobile-gate,baidu-transcoder/1.0.6.0
            else if (agent.IndexOf("baiduspider") > -1)
                spiderBot = "Baiduspider";
            else if (agent.IndexOf("baiducustomer") > -1)
                spiderBot = "Baidu|BaiduCustomer";
            else if (agent.IndexOf("baidu-thumbnail") > -1)
                spiderBot = "Baidu|Baidu-Thumbnail";
            else if (agent.IndexOf("baiduspider-mobile-gate") > -1)
                spiderBot = "Baidu|Baiduspider-Mobile-Gate";
            else if (agent.IndexOf("baidu-transcoder/1.0.6.0") > -1)
                spiderBot = "Baidu|Baidu-Transcoder/1.0.6.0";
            else if (agent.IndexOf("Baidu") > -1)
                spiderBot = "Baidu|Baidu";
            //腾讯搜搜soso   
            else if (agent.IndexOf("sosospider") > -1)
                spiderBot = "Soso|Sosospider";
            else if (agent.IndexOf("sosoblogspider") > -1)
                spiderBot = "Soso|SosoBlogspider";
            else if (agent.IndexOf("sosoimagespider") > -1)
                spiderBot = "Soso|SosoImagespider";
            else if (agent.IndexOf("soso") > -1)
                spiderBot = "Soso|Soso";
            // 网易有道   
            else if (agent.IndexOf("youdaobot/1.0") > -1)
                spiderBot = "Youdao|YoudaoBot/1.0";
            else if (agent.IndexOf("yodaobot-image/1.0") > -1)
                spiderBot = "Youdao|YodaoBot-Image/1.0";
            else if (agent.IndexOf("yodaobot-reader/1.0") > -1)
                spiderBot = "Youdao|Yodaobot-Reader/1.0";
            else if (agent.IndexOf("youdao") > -1)
                spiderBot = "Youdao|Youdao";
            //搜狐搜狗  
            //if instr(agent, "sogou web robot") > 0 then bot = "Sogou web robot"  
            //if instr(agent, "sogou web spider/3.0") > 0 then Bot = "Sogou web spider/3.0"  
            //if instr(agent, "sogou web spider/4.0") > 0 then Bot = "Sogou web spider/4.0"  
            //if instr(agent, "sogou head spider/3.0") > 0 then Bot = "Sogou head spider/3.0"  
            //if instr(agent, "sogou-test-spider/4.0") > 0 then Bot = "Sogou-Test-Spider/4.0"  
            //if instr(agent, "sogou orion spider/4.0") > 0 then Bot = "Sogou Orion spider/4.0"  
            else if (agent.IndexOf("sogou") > -1)
                spiderBot = "Sogou|Sogou";
            //'Alexa   
            else if (agent.IndexOf("ia_archiver") > -1)
                spiderBot = "Alexa|Alexa Ia_archiver";
            else if (agent.IndexOf("iaarchiver") > -1)
                spiderBot = "Alexa|Alexa Iaarchiver";
            // 'Cuil   
            else if (agent.IndexOf("twiceler-0.9") > -1)
                spiderBot = "Cuil|Twiceler-0.9";
            // '奇虎   
            else if (agent.IndexOf("qihoo") > -1 || agent.IndexOf("360spider") > -1)
                spiderBot = "Qihoo|Qihoo";
            // 'ASK.com   
            else if (agent.IndexOf("ask jeeves/teoma") > -1)
                spiderBot = "Ask|Ask Jeeves/Teoma";
            #region 其他爬虫信息，暂时不实现
            //if instr(agent, "50.nu/0.01") > 0 then Bot = "50.nu/0.01"  
            // if instr(agent, "aspseek") > 0 then Bot = "ASPSeek"  
            // if instr(agent, "betabot") > 0 then Bot = "betaBot"  
            // if instr(agent, "blogpulselive") > 0 then Bot = "BlogPulseLive"  
            // if instr(agent, "blogpulse (isspider-3.0)") > 0 then Bot = "BlogPulse (ISSpider-3.0)"  
            // if instr(agent, "blogvibebot-v1.1") > 0 then Bot = "BlogVibeBot-v1.1"  
            // if instr(agent, "blogsearch/2") > 0 then Bot = "BlogSearch/2"  
            // if instr(agent, "builtwith/0.3") > 0 then Bot = "BuiltWith/0.3"  
            // if instr(agent, "buzzbot/1.0") > 0 then Bot = "BuzzBot/1.0"  
            // if instr(agent, "daumoa/2.0") > 0 then Bot = "Daumoa/2.0"  
            // if instr(agent, "domaintools") > 0 then Bot = "DomainTools"  
            // if instr(agent, "dotbot/1.1") > 0 then Bot = "DotBot/1.1"  
            // if instr(agent, "eapollobot") > 0 then Bot = "eApolloBot"  
            // if instr(agent, "exabot") > 0 then Bot = "Exabot"  
            // if instr(agent, "fast-webcrawler") > 0 then Bot = "Alltheweb"  
            // if instr(agent, "feedburner/1.0") > 0 then Bot = "FeedBurner/1.0"  
            // if instr(agent, "followsite bot") > 0 then Bot = "FollowSite Bot"  
            // if instr(agent, "gaisbot/3.0") > 0 then Bot = "Gaisbot/3.0"  
            // if instr(agent, "gigabot") > 0 then Bot = "Gigabot"  
            // if instr(agent, "gingercrawler/1.0") > 0 then Bot = "GingerCrawler/1.0"  
            // if instr(agent, "hitcrawler_0.1") > 0 then Bot = "hitcrawler_0.1"  
            // if instr(agent, "iaskspider/1.0") > 0 then Bot = "iaskspider/1.0"  
            // if instr(agent, "iaskspider/2.0") > 0 then Bot = "iaskspider/2.0"  
            // if instr(agent, "iearthworm") > 0 then Bot = "iearthworm"  
            // if instr(agent, "jyxobot/1") > 0 then Bot = "Jyxobot/1"  
            // if instr(agent, "larbin") > 0 then Bot = "Larbin"  
            // if instr(agent, "lanshanbot") > 0 then Bot = "lanshanbot"  
            //if instr(agent, "lycos_spider_(t-rex)") > 0 then Bot = "Lycos"  
            // if instr(agent, "markmonitor robots") > 0 then Bot = "MarkMonitor Robots"  
            // if instr(agent, "mj12bot/v1.2.1") > 0 then Bot = "MJ12bot/v1.2.1"  
            // if instr(agent, "mj12bot/v1.2.2") > 0 then Bot = "MJ12bot/v1.2.2"  
            // if instr(agent, "mj12bot/v1.2.3") > 0 then Bot = "MJ12bot/v1.2.3"  
            // if instr(agent, "mj12bot/v1.2.4") > 0 then Bot = "MJ12bot/v1.2.4"  
            // if instr(agent, "mj12bot/v1.2.5") > 0 then Bot = "MJ12bot/v1.2.5"  
            // if instr(agent, "naverbot/1.0") > 0 then Bot = "NaverBot/1.0"  
            // if instr(agent, "netcraftsurveyagent/1.0") > 0 then Bot = "NetcraftSurveyAgent/1.0"  
            // if instr(agent, "netcraft web server survey") > 0 then Bot = "Netcraft Web Server Survey"  
            // if instr(agent, "page2rss/0.5") > 0 then Bot = "Page2RSS/0.5"  
            // if instr(agent, "panscient.com") > 0 then Bot = "panscient.com"'恶意爬虫   
            // if instr(agent, "pku student spider") > 0 then Bot = "PKU Student Spider"  
            // if instr(agent, "psbot/0.1") > 0 then Bot = "psbot/0.1"  
            // if instr(agent, "scooter") > 0 then Bot = "Altavista"  
            // if instr(agent, "servage robot") > 0 then Bot = "Servage Robot"  
            // if instr(agent, "snapbot") > 0 then Bot = "Snapbot"  
            // if instr(agent, "spinn3r") > 0 then Bot = "Spinn3r"  
            // if instr(agent, "sqworm") > 0 then Bot = "AOL"  
            // if instr(agent, "stealer") > 0 then Bot = "Stealer"  
            // if instr(agent, "tagoobot/3.0") > 0 then Bot = "Tagoobot/3.0"  
            // if instr(agent, "twingly recon") > 0 then Bot = "Twingly Recon"  
            // if instr(agent, "urlfan-bot/1.0") > 0 then Bot = "urlfan-bot/1.0"  
            // if instr(agent, "webalta") > 0 then Bot = "WebAlta"  
            // if instr(agent, "yandex/1.01.001") > 0 then Bot = "Yandex/1.01.001"  
            // if instr(agent, "yeti/1.0") > 0 then Bot = "Yeti/1.0"  
            #endregion
            else if (System.Text.RegularExpressions.Regex.IsMatch(agent, @"(Bot|Crawl|Spider)"))
                spiderBot = "Other|Other Spider";
            return spiderBot;
        }
        #endregion

        #region 获取客户端语言
        /// <summary>
        /// 获取客户端语言
        /// </summary>
        /// <param name="context">当前活跃的Http上下文对象</param>
        /// <returns></returns>
        public static string GetLangage(System.Web.HttpContext context)
        {
            string[] langage = context.Request.UserLanguages;
            return langage == null ? string.Empty : langage[0];
        }
        #endregion

        #region 获取浏览器和版本信息
        /// <summary>
        /// 获取浏览器和版本信息
        /// </summary>
        /// <param name="agent">user-agent</param>
        /// <returns></returns>
        public static string GetBrowser(string agent)
        {

            string browser = "other";
            if (string.IsNullOrEmpty(agent))
                return browser;
            agent = agent.ToLower();
            /*
             *  微信
             *  android:    Mozilla/5.0 (Linux; U; Android 2.3.6; zh-cn; GT-S5660 Build/GINGERBREAD) AppleWebKit/533.1 (KHTML, like Gecko) Version/4.0 Mobile Safari/533.1 MicroMessenger/4.5.255
             *  iPhone:     Mozilla/5.0 (iPhone; CPU iPhone OS 5_1 like Mac OS X) AppleWebKit/534.46 (KHTML, like Gecko) Mobile/9B176 MicroMessenger/4.3.2
             */
            if (agent.Contains("micromessenger"))
                browser = "WeiXin";

            /*
             *  百度
             *  android:    Mozilla/5.0 (Linux; Android 4.4.4; HTC D820u Build/KTU84P) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/33.0.0.0 Mobile Safari/537.36 bdbrowser_i18n/4.6.0.7
             *              Mozilla/5.0 (Linux; U; Android 4.4.4; zh-cn; HTC D820u Build/KTU84P) AppleWebKit/534.24 (KHTML, like Gecko) Version/4.0 Mobile Safari/534.24 T5/2.0 baidubrowser/5.3.4.0 (Baidu; P1 4.4.4)
             *  iPhone:     
             *  PC:         
             */
            else if (agent.Contains("bdbrowser") || agent.Contains("baidubrowser") || agent.Contains("baidu"))
                browser = "Baidu";
            /*
             *  搜狗
             *  android:    Mozilla/5.0 (Linux; U; Android 4.4.4; zh-cn; HTC D820u Build/KTU84P) AppleWebKit/534.30 (KHTML, like Gecko) Version/4.0 Mobile Safari/534.30 SogouMSE,SogouMobileBrowser/3.5.1
             *  iPhone:     Mozilla/5.0 (iPhone; CPU iPhone OS 8_0 like Mac OS X) AppleWebKit/600.1.4 (KHTML, like Gecko) Mobile/12A365 SogouMobileBrowser/3.5.1
             *  PC:         Mozilla/5.0 (Windows; U; Windows NT 6.1; en-US) AppleWebKit/534.3 (KHTML, like Gecko)  Chrome/6.0.472.33 Safari/534.3 SE 2.X MetaSr 1.0 
             */
            else if (agent.Contains("sogou") || agent.Contains("metaSr"))
                browser = "Sogou";

             /*
             *  360
             *  PC:         User-Agent: Mozilla/4.0 (compatible; MSIE 7.0; Windows NT 5.1; Trident/4.0; InfoPath.2; .NET4.0C; .NET4.0E; .NET CLR 2.0.50727; 360SE)
             */
            else if (agent.Contains("360se"))
                browser = "360";
            /*
             *  QQ浏览器
             *  android:    Mozilla/5.0 (Linux; U; Android 4.4.4; zh-cn; HTC D820u Build/KTU84P) AppleWebKit/537.36 (KHTML, like Gecko)Version/4.0 MQQBrowser/5.6 Mobile Safari/537.36
             *  iPhone:     Mozilla/5.0 (iPhone 5SGLOBAL; CPU iPhone OS 8_0 like Mac OS X) AppleWebKit/600.1.4 (KHTML, like Gecko) Version/6.0 MQQBrowser/5.6 Mobile/12A365 Safari/8536.25
             *  PC:         Mozilla/4.0 (compatible; MSIE 7.0; Windows NT 5.1; Trident/4.0; TencentTraveler 4.0; .NET CLR 2.0.50727)
             */
            else if (agent.Contains("mqqbrowser") || agent.Contains("tencenttraveler") || agent.Contains("qqbrowser"))
                browser = "QQ";

            /*
             *  UC浏览器，uc老版本太坑爹，可以在这里看到：http://www.uc.cn/a/product/2013/0403/2795.html
             *  android:    UCWEB/2.0  (Linux;  U;  Adr  2.3;  zh-CN;  MI-ONEPlus)  U2/1.0.0  UCBrowser/8.6.0.199  U2/1.0.0 Mobile
             *  iPhone:     UCWEB/2.0 (iOS; U; iPh OS 4_3_2; zh-CN; iPh4) U2/1.0.0 UCBrowser/8.6.0.199 U2/1.0.0 Mobile
             */
            else if (agent.Contains("ucbrowser") || agent.Contains("ucweb"))
                browser = "UC";

            /*
             *  遨游
             *  android:    
             *  iPhone:     Mozilla/5.0 (iPhone; CPU iPhone OS 7_1 like Mac OS X) AppleWebKit/537.51.2 (KHTML, like Gecko) Version/7.0 Mobile/11D167 Safari/9537.53
             *  PC:         
             */
            else if (agent.Contains("maxthon"))
                browser = "Maxthon";
            /*
             *  Opera
             *  android:    Mozilla/5.0 (Linux; U; Android 4.4.4; zh-CN; HTC D820u Build/KTU84P) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Oupeng/10.2.3.88150 Mobile Safari/537.36
             *  iPhone:     
             *  PC:         
             */
            else if (agent.Contains("opera"))
                browser = "Opera";

            /*
             *  IE
             *  PC:         5.0 (Windows NT 6.1; WOW64; Trident/7.0; SLCC2; .NET CLR 2.0.50727; .NET CLR 3.5.30729; .NET CLR 3.0.30729; Media Center PC 6.0; .NET4.0C; .NET4.0E; rv:11.0) like Gecko
             *  微软在Windows Phone 8.1 Update里，把Windows Phone的IE11 User Agent改成:
             *  Mozilla/5.0 (Mobile; Windows Phone 8.1; Android 4.0; ARM; Trident/7.0; Touch; rv:11.0; IEMobile/11.0; NOKIA; Lumia 930) like iPhone OS 7_0_3 Mac OS X AppleWebKit/537 (KHTML, like Gecko) Mobile Safari/537 
             *  IE10以后ua不再包含msie
             */
            else if (agent.Contains("msie") || agent.Contains("windows phone") || (!agent.Contains("firefox") && !agent.Contains("chrome") && !agent.Contains("safari") && agent.Contains("windows nt")))
            {
                if (agent.Contains("msie 6.0"))
                    browser = "IE 6.0";
                else if (agent.Contains("msie 7.0"))
                    browser = "IE 7.0";
                else if (agent.Contains("msie 8.0"))
                    browser = "IE 8.0";
                else if (agent.Contains("msie 9.0"))
                    browser = "IE 9.0";
                else
                    browser = "IE";
            }


            /*
             *  Chrome
             *  android:    Mozilla/5.0 (Linux; Android 4.4.4; HTC D820u Build/KTU84P) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/40.0.2214.89 Mobile Safari/537.36
             *  iPhone:     Mozilla/5.0 (iPhone; CPU iPhone OS 8_0 like Mac OS X) AppleWebKit/600.1.4 (KHTML, like Gecko) CriOS/40.0.2214.69 Mobile/12A365 Safari/600.1.4
             *  PC:         Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/42.0.2311.152 Safari/537.36
             */
            else if (agent.Contains("chrome"))
                browser = "Chrome";

            /*
             *  Firefox
             *  android:    Mozilla/5.0 (Android; Mobile; rv:35.0) Gecko/35.0 Firefox/35.0
             *  iPhone:     
             *  PC:         Mozilla/5.0 (Windows NT 6.1; WOW64; rv:37.0) Gecko/20100101 Firefox/37.0
             */
            else if (agent.Contains("firefox"))
                browser = "Firefox";
            /*
             *  Safari
             *  android:    
             *  iPhone:     Mozilla/5.0 (iPhone; U; CPU iPhone OS 4_3_3 like Mac OS X; en-us) AppleWebKit/533.17.9 (KHTML, like Gecko) Version/5.0.2 Mobile/8J2 Safari/6533.18.5
             *  PC:         Mozilla/5.0 (Macintosh; U; Intel Mac OS X 10_6_8; en-us) AppleWebKit/534.50 (KHTML, like Gecko) Version/5.1 Safari/534.50
             */
            else if (agent.Contains("safari"))
                browser = "Safari";
            return browser;

        }
        #endregion


        #region 获得操作系统信息
        /// <summary>
        /// 获得操作系统信息
        /// </summary>
        /// <param name="agent">user-agent</param>
        /// <returns></returns>
        public static string GetClientOS(string agent)
        {
            string os = string.Empty;
            if (agent == null)
                return "Other";
            agent = agent.ToLower();
            if (agent.IndexOf("android") > -1)
                os = "Android";
            else if (agent.IndexOf("iphone") > -1 || agent.IndexOf("ipad") > -1 || agent.IndexOf("ipod") > -1)
                os = "IOS";
            else if (agent.IndexOf("iwatch") > -1)
                os = "iWatch";
            else if (agent.IndexOf("windows phone") > -1)
                os = "Windows Phone";
            else if (agent.IndexOf("symbianOS") > -1)
                os = "SymbianOS";
            else if (agent.IndexOf("nt 6.4") > -1 || agent.IndexOf("nt 10.0") > -1)
                os = "Windows 10";
            else if (agent.IndexOf("nt 6.3") > -1 || agent.IndexOf("windows 8.1") > -1)
                os = "Windows 8.1";
            else if (agent.IndexOf("nt 6.2") > -1 || agent.IndexOf("windows 8") > -1)
                os = "Windows 8";
            else if (agent.IndexOf("nt 6.1") > -1 || agent.IndexOf("windows 7") > -1)
                os = "Windows 7";
            else if (agent.IndexOf("nt 6.0") > -1 || agent.IndexOf("windows Vista") > -1)
                os = "Windows Vista";
            else if (agent.IndexOf("nt 5.2") > -1)
                os = "Windows 2003";
            else if (agent.IndexOf("nt 5.1") > -1)
                os = "Windows XP";
            else if (agent.IndexOf("nt 5") > -1)
                os = "Windows 2000";
            else if (agent.IndexOf("nt 4.9") > -1)
                os = "Windows ME";
            else if (agent.IndexOf("nt 4") > -1)
                os = "Windows NT4";
            else if (agent.IndexOf("nt 98") > -1)
                os = "Windows 98";
            else if (agent.IndexOf("nt 95") > -1)
                os = "Windows 95";
            else if (agent.IndexOf("nt") > -1)
                os = "Windows";
            else if (agent.IndexOf("mac") > -1)
                os = "Mac";
            else if (agent.IndexOf("linux") > -1)
                os = "Linux";
            else if (agent.IndexOf("freebsd") > -1)
                os = "FreeBSD";
            else if (agent.IndexOf("sunos") > -1)
                os = "SunOS";
            else if (agent.IndexOf("os/2") > -1)
                os = "OS/2";
            else if (agent.IndexOf("aix") > -1)
                os = "AIX";
            else if (agent.ToLower().IndexOf("unix") > -1)
                os = "Unix";
            else if (System.Text.RegularExpressions.Regex.IsMatch(agent, @"(bot|crawl|spider)"))
                os = "Spiders";
            else
                os = "Other";
            return os;
        } 
        #endregion
        #endregion

    }
}
