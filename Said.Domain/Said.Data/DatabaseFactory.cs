using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Said.Domain.Said.Data
{
    public class DatabaseFactory : Disposable
    {
        private SaidDbContext context;
        /// <summary>
        /// 获取一个EF的存储单元对象
        /// </summary>
        /// <returns>SocialGoalEntities实例</returns>
        public SaidDbContext Get()
        {
            return context ?? (context = new SaidDbContext());
        }

        #region override
        /// <summary>
        /// 重写Disposable父类的释放内存
        /// </summary>
        protected override void DisposeCore()
        {
            if (context != null)
                context.Dispose();
        }
        #endregion
    }
}
