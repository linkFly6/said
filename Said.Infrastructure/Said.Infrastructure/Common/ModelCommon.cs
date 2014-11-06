using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;
using System.Text;
using System.Threading.Tasks;


namespace Said.Common
{
    /// <summary>
    /// Model辅助工具
    /// </summary>
    public static class ModelCommon
    {
        /// <summary>
        /// 反射一个对象，得到该对象的所有属性
        /// </summary>
        /// <typeparam name="T"></typeparam>
        /// <returns></returns>
        public static PropertyInfo[] GetPropertyInfoArray<T>()
        {
            PropertyInfo[] props = null;
            try
            {
                Type type = typeof(T);
                //object obj = Activator.CreateInstance(type);
                props = type.GetProperties(BindingFlags.Public | BindingFlags.Instance);
            }
            catch (Exception ex)
            { }
            return props;
        }

    }
}
