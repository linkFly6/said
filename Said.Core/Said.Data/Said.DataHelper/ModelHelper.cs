using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;
using System.Text;
using System.Threading.Tasks;

namespace Said.DataHelper
{
    /// <summary>
    /// 这个类提供实体类相关的操作
    /// </summary>
    public static class ModelHelper
    {

        #region GetModelProperties<T>(T model) - 该方法反射得到一个和数据库映射的[列,值]哈希表
        /// <summary>
        /// 该方法反射得到一个和数据库映射的[列,值]哈希表，注意，列不一定与属性相关
        /// </summary>
        /// <typeparam name="T">该对象要求对象的实例</typeparam>
        /// <returns></returns>
        public static Dictionary<string, object> GetModelProperties<T>(T model) where T : new()
        {
            Dictionary<string, object> modelList = new Dictionary<string, object>();
            if (model == null) return modelList;
            //获取对象类型，注意，这里获取是对象的实例
            Type type = model.GetType();
            PropertyInfo[] properties = type.GetProperties();
            //遍历属性
            foreach (PropertyInfo item in properties)
            {

                //！！！！【注意，架构一个对象，这个对象作为反射对象后的桥梁】，然后外面就可以依赖这个反射后的对象拼接字符串


                //进行反射
                ModelToDataAttribute attr = item.GetCustomAttribute(typeof(ModelToDataAttribute), true) as ModelToDataAttribute;
                var value = item.GetValue(model, null);
                if (attr == null)
                {
                    attr = new ModelToDataAttribute();
                    attr.ColumnName = item.Name;
                }
                else if (string.IsNullOrEmpty(attr.ColumnName))
                {
                    attr.ColumnName = item.Name;
                }
                //允许为空的字段，且值为空，则插入null
                if (!attr.IsNotNull && value == null)
                    value = DBNull.Value;
                modelList.Add(attr.ColumnName, value);
            }
            return modelList;
        }
        #endregion

        #region ReflectionToField<T> - 该方法纯粹的反射一个类型，并获取该model对应的数据库字段（根据属性）
        /// <summary>
        /// 该方法纯粹的反射一个类型，并获取该model对应的数据库字段（根据属性），返回[属性,列名] ，该方法返回与属性相关，与属性值无关
        /// 既然是通过类反射，那么应该考虑缓存机制
        /// </summary>
        /// <typeparam name="T">要反射的对象</typeparam>
        /// <returns></returns>
        public static Dictionary<string, ModelToDataAttribute> ReflectionToField<T>()
        {
            Dictionary<string, ModelToDataAttribute> modelList = new Dictionary<string, ModelToDataAttribute>();
            //获取类的类型，注意，这里不是实例
            Type type = typeof(T);
            PropertyInfo[] properties = type.GetProperties();
            //遍历属性
            foreach (PropertyInfo item in properties)
            {
                //进行反射，这里不能获取属性值，理论上应该会报错
                ModelToDataAttribute attr = item.GetCustomAttribute(typeof(ModelToDataAttribute), true) as ModelToDataAttribute;
                if (attr == null)
                {
                    attr = new ModelToDataAttribute();
                    attr.ColumnName = item.Name;
                }
                else if (string.IsNullOrEmpty(attr.ColumnName))
                {
                    attr.ColumnName = item.Name;
                }
                modelList.Add(item.Name, attr);
            }
            return modelList;
        }
        #endregion


    }
}
