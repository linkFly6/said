using System;
using System.Collections.Generic;
using System.Linq;
using System.Runtime.Remoting.Messaging;
using System.Text;
using System.Threading.Tasks;

namespace Said.Domain.Said.Data
{
    public static class DatabaseFactory //: Disposable
    {
        /// <summary>
        /// 获取一个EF的存储单元对象
        /// </summary>
        /// <returns>SocialGoalEntities实例</returns>
        public static SaidDbContext Get()
        {
            // CallContext 基于线程存储
            SaidDbContext context = context = CallContext.GetData("DbContext") as SaidDbContext;
            if (context == null)
            {
                context = new SaidDbContext();
                CallContext.SetData("DbContext", context);
            }
            return context;
        }

        #region override
        /// <summary>
        /// 重写Disposable父类的释放内存
        /// </summary>
        //protected override void DisposeCore()
        //{
        //    if (context != null)
        //        context.Dispose();
        //}
        #endregion
    }
}
