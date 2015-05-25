using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Http.Controllers;
using System.Web.Http.Filters;


namespace Said.Controllers.Filters
{
    public class UserFilterAttribute : ActionFilterAttribute
    {
        /*
         * IP地址：http://gghaomm.iteye.com/blog/1748038
         * ip.taobao.com/instructions.php?ip=[ip地址字串] 
         * {"code":0,"data":{"ip":"210.75.225.254","country":"\u4e2d\u56fd","area":"\u534e\u5317",
            "region":"\u5317\u4eac\u5e02","city":"\u5317\u4eac\u5e02","county":"","isp":"\u7535\u4fe1",
            "country_id":"86","area_id":"100000","region_id":"110000","city_id":"110000",
            "county_id":"-1","isp_id":"100017"}}
         * 
         */

        private void GetIP() { 
        
        }

        public override void OnActionExecuting(HttpActionContext actionContext)
        {

            
            base.OnActionExecuting(actionContext);
        }
        //public override void OnActionExecuted(HttpActionExecutedContext actionExecutedContext)
        //{
        //    base.OnActionExecuted(actionExecutedContext);
        //}
    }
}