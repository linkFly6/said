using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace Said.Controllers
{
    public class HomeController : BaseController
    {
        //
        // GET: /Home/

        public ActionResult Index()
        {

            System.Diagnostics.Debug.WriteLine(Request.Browser);
            System.Diagnostics.Debug.WriteLine(Request.Cookies);
            System.Diagnostics.Debug.WriteLine(Request.Headers);

            //ALL_HTTP=HTTP_CONNECTION:keep-alive
            //HTTP_ACCEPT:text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8
            //HTTP_ACCEPT_ENCODING:gzip,+deflate
            //HTTP_ACCEPT_LANGUAGE:zh-CN,zh;q=0.8,en-US;q=0.5,en;q=0.3
            //HTTP_HOST:localhost:3061
            //HTTP_USER_AGENT:Mozilla/5.0+(Windows+NT+6.1;+WOW64;+rv:37.0)+Gecko/20100101+Firefox/37.0
            //&ALL_RAW=Connection:+keep-alive
            //Accept:+text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8
            //Accept-Encoding:+gzip,+deflate
            //Accept-Language:+zh-CN,zh;q=0.8,en-US;q=0.5,en;q=0.3
            //Host:+localhost:3061
            //User-Agent:+Mozilla/5.0+(Windows+NT+6.1;+WOW64;+rv:37.0)+Gecko/20100101+Firefox/37.0
            //&APPL_MD_PATH=/LM/W3SVC/4/ROOT&APPL_PHYSICAL_PATH=F:\Github\Said\Said\&AUTH_TYPE=&AUTH_USER=&AUTH_PASSWORD=&LOGON_USER=&REMOTE_USER=&CERT_COOKIE=&CERT_FLAGS=&CERT_ISSUER=&CERT_KEYSIZE=&CERT_SECRETKEYSIZE=&CERT_SERIALNUMBER=&CERT_SERVER_ISSUER=&CERT_SERVER_SUBJECT=&CERT_SUBJECT=&CONTENT_LENGTH=0&CONTENT_TYPE=&GATEWAY_INTERFACE=CGI/1.1&HTTPS=off&HTTPS_KEYSIZE=&HTTPS_SECRETKEYSIZE=&HTTPS_SERVER_ISSUER=&HTTPS_SERVER_SUBJECT=&INSTANCE_ID=4&INSTANCE_META_PATH=/LM/W3SVC/4&LOCAL_ADDR=::1&PATH_INFO=/&PATH_TRANSLATED=F:\Github\Said\Said&QUERY_STRING=&REMOTE_ADDR=::1&REMOTE_HOST=::1&REMOTE_PORT=34616&REQUEST_METHOD=GET&SCRIPT_NAME=/&SERVER_NAME=localhost&SERVER_PORT=3061&SERVER_PORT_SECURE=0&SERVER_PROTOCOL=HTTP/1.1&SERVER_SOFTWARE=Microsoft-IIS/8.0&URL=/&HTTP_CONNECTION=keep-alive&HTTP_ACCEPT=text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8&HTTP_ACCEPT_ENCODING=gzip,+deflate&HTTP_ACCEPT_LANGUAGE=zh-CN,zh;q=0.8,en-US;q=0.5,en;q=0.3&HTTP_HOST=localhost:3061&HTTP_USER_AGENT=Mozilla/5.0+(Windows+NT+6.1;+WOW64;+rv:37.0)+Gecko/20100101+Firefox/37.0

            System.Diagnostics.Debug.WriteLine(Request.ServerVariables);
            System.Diagnostics.Debug.WriteLine(Request.InputStream);
            System.Diagnostics.Debug.WriteLine(Request.UserLanguages);
            System.Diagnostics.Debug.WriteLine(Request.UserHostName);
            System.Diagnostics.Debug.WriteLine(Request.UserHostAddress);
            System.Diagnostics.Debug.WriteLine(Request.UserAgent);
            System.Diagnostics.Debug.WriteLine(Request.UrlReferrer);
            System.Diagnostics.Debug.WriteLine(Request.Url);
            System.Diagnostics.Debug.WriteLine(Request.Unvalidated);
            System.Diagnostics.Debug.WriteLine(Request.RequestContext);
            System.Diagnostics.Debug.WriteLine(Request.ReadEntityBodyMode);
            System.Diagnostics.Debug.WriteLine(Request.RawUrl);
            System.Diagnostics.Debug.WriteLine(Request.QueryString);
            System.Diagnostics.Debug.WriteLine(Request.PhysicalPath);
            System.Diagnostics.Debug.WriteLine(Request.PathInfo);
            System.Diagnostics.Debug.WriteLine(Request.Path);
            System.Diagnostics.Debug.WriteLine(Request.Params);
            System.Diagnostics.Debug.WriteLine(Request.IsLocal);
            System.Diagnostics.Debug.WriteLine(Request.IsSecureConnection);
            return View();
        }

    }
}
