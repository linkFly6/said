using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Reflection;
using System.Text;
using System.Threading.Tasks;
using System.Web;

namespace Said.Models
{
    /// <summary>
    ///  DTD 基类
    /// </summary>
    public abstract class BaseModel
    {
        /// <summary>
        /// 数据状态（0：正常 1：已删除）
        /// </summary>
        public int IsDel { get; set; }

        /// <summary>
        /// 关键日期
        /// </summary>
        public DateTime Date { get; set; }
        /// <summary>
        /// 实体验证方法
        /// </summary>
        /// <param name="validationContext">验证上下文</param>
        /// <returns>验证结果迭代器</returns>
        public abstract IEnumerable<ValidationResult> Validate();


        private Type typeString = typeof(string);


        /// <summary>
        /// 解码对象自身
        /// </summary>
        /// <returns></returns>
        public virtual BaseModel DecodeModel()
        {
            PropertyInfo[] props = this.GetPropertyInfoArray();
            foreach (var item in props)
            {
                var temp = item.GetValue(this);
                if (item.SetMethod != null && item.PropertyType == typeString && temp != null)
                    item.SetValue(this, HttpUtility.UrlDecode(temp.ToString()));
            }
            return this;
        }

        /// <summary>
        /// 反射自身，获取该对象所有属性
        /// </summary>
        /// <returns></returns>
        public PropertyInfo[] GetPropertyInfoArray()
        {
            PropertyInfo[] props = null;
            try
            {
                Type type = this.GetType();
                //object obj = Activator.CreateInstance(type);
                props = type.GetProperties(BindingFlags.Public | BindingFlags.Instance);
            }
            catch (Exception)
            { }
            return props;
        }

    }
}
