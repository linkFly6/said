using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Said.Test
{
    class Program
    {
        static void Main(string[] args)
        {
            var date = DateTime.Now;
            var data = new TestData();
            Console.WriteLine("运行测试方法，开始添加数据");
            data.InitClassifyData();
            data.InitSongData();
            Console.WriteLine("添加数据完毕，耗时：{0}", (DateTime.Now - date).TotalMilliseconds);
            Console.Read();
        }
    }
}
