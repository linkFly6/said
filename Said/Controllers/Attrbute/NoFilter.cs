using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace Said.Controllers.Attrbute
{
    /// <summary>
    /// 启用不过滤特性
    /// </summary>
    [AttributeUsage(AttributeTargets.Class | AttributeTargets.Method, AllowMultiple = false, Inherited = false)]
    public class NoFilter : Attribute
    {
    }
}