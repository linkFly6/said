using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Said.Domain.Said.Data
{
    public class Disposable : IDisposable
    {
        private bool isDisposed;
        /*
         * 析构函数(destructor)
         * http://www.cnblogs.com/gsk99/archive/2011/11/02/2233291.html
         * http://msdn.microsoft.com/zh-cn/library/66x5fx1b.aspx
         * http://www.cnblogs.com/paper/archive/2009/07/31/1535998.html
         */
        ~Disposable()
        {

            Dispose(false);
        }
        public void Dispose()
        {
            Dispose(true);
            /*
             * http://msdn.microsoft.com/zh-cn/library/system.object.finalize.aspx
             */
            GC.SuppressFinalize(this);
        }
        private void Dispose(bool disposing)
        {
            if (!isDisposed && disposing)
                DisposeCore();
            isDisposed = true;
        }
        protected virtual void DisposeCore()
        {
            //给子类分发一个方法，让子类手动释放内存
        }
    }
}
