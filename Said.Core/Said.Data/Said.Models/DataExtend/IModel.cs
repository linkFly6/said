using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;
using System.Text;
using System.Text.RegularExpressions;
using System.Threading.Tasks;

namespace Said.Models.DataExtend
{
    /// <summary>
    /// Models类直接父类，提供一系列Models的方法，这个类的位置建错了，应该是dal层
    /// 2014-06-24 23:02:13 - linkFLy
    /// </summary>
    public class IModel
    {
        #region 通过反射检测属性值是否合法
        /// <summary>
        /// 通过反射检测属性值是否合法，除了返回false，同时将详细的StringBuilder对象返回在result参数中
        /// </summary>
        /// <param name="result">该参数会保存验证失败后的字符串信息</param>
        /// <returns></returns>
        bool Check(StringBuilder result)
        {
            bool isCheck = true;
            if (result == null)
                result = new StringBuilder();
            Type type = this.GetType();
            //获取属性列表
            PropertyInfo[] properties = type.GetProperties();
            //获取每个属性
            foreach (PropertyInfo item in properties)
            {
                //返回该属性的特性
                object[] list = item.GetCustomAttributes(typeof(ModelsValidateAttribute), true);
                if (list != null)
                {
                    //获取特性值
                    object value = item.GetValue(this, null);
                    //循环每个特性，检测属性是否合法
                    foreach (ModelsValidateAttribute attr in list)
                    {
                        switch (attr.ValidateType)
                        {
                            case ValidateType.Empty:
                                {
                                    if (string.IsNullOrEmpty(value + ""))
                                    {
                                        result.AppendFormat("{0}不允许为空\n", attr.Name);
                                        isCheck = false;
                                    }
                                }
                                break;
                            case ValidateType.MaxLength:
                                {
                                    if ((value + "").ToString().Length > attr.MaxValue)
                                    {
                                        result.AppendFormat("{0}不允许超过最大长度{1}\n", attr.Name, attr.MaxValue);
                                        isCheck = false;
                                    }
                                }
                                break;
                            case ValidateType.MinLength:
                                if ((value + "").ToString().Length > attr.MinValue)
                                {
                                    result.AppendFormat("{0}允许的最小长度为{1}\n", attr.Name, attr.MinValue);
                                    isCheck = false;
                                }
                                break;
                            case ValidateType.Range:
                                {
                                    if (attr.Range == null) break;
                                    bool has = Array.Exists<string>(attr.Range, delegate(string str) { return str == value; });
                                    if (!has)
                                    {
                                        result.AppendFormat("{0}的值不正确，应该为[{1}]中的一种\n", attr.Name, string.Join(",", attr.Range));
                                        isCheck = false;
                                    }
                                }
                                break;
                            case ValidateType.Reg:
                                if (string.IsNullOrEmpty(value.ToString()) || attr.Reg == null) break;
                                if (!attr.Reg.IsMatch(value.ToString()))
                                {
                                    result.AppendFormat("{0}的不是指定的数据\n", attr.Name);
                                    isCheck = false;
                                }
                                break;
                            case ValidateType.Length:
                                if (attr.Length != value.ToString().Length)
                                {
                                    result.AppendFormat("{0}的长度只允许为{1}\n", attr.Name, attr.Length);
                                    isCheck = false;
                                }
                                break;
                            case ValidateType.Gender:
                                {
                                    int temp = (int)value;
                                    if (temp != 0 && temp != 1 && temp != 2)
                                    {
                                        result.AppendFormat("{0}的值只允许为0、1、2其中的一个\n");
                                        isCheck = false;
                                    }
                                }
                                break;
                            case ValidateType.Phone:
                                {
                                    if (string.IsNullOrEmpty(value.ToString())) break;
                                    //这里的电话号码正则需要调整，这是从网上找的，可能有问题
                                    if (!Regex.IsMatch(value.ToString(), @"((\d{11})|^((\d{7,8})|(\d{4}|\d{3})-(\d{7,8})|(\d{4}|\d{3})-(\d{7,8})-(\d{4}|\d{3}|\d{2}|\d{1})|(\d{7,8})-(\d{4}|\d{3}|\d{2}|\d{1}))$)"))
                                    {
                                        result.AppendFormat("{0}不是可以识别的电话号码格式\n", attr.Name);
                                        isCheck = false;
                                    }
                                }
                                break;
                            case ValidateType.Email:
                                {
                                    if (string.IsNullOrEmpty(value.ToString())) break;
                                    //这里的Email正则需要调整
                                    if (!Regex.IsMatch(value.ToString(), @"^((?'name'.+?)\s*<)?(?'email'(?>[a-zA-Z\d!#$%&'*+\-/=?^_`{|}~]+\x20*|""(?'user'(?=[\x01-\x7f])[^""\\]|\\[\x01-\x7f])*""\x20*)*(?'angle'<))?(?'user'(?!\.)(?>\.?[a-zA-Z\d!#$%&'*+\-/=?^_`{|}~]+)+|""((?=[\x01-\x7f])[^""\\]|\\[\x01-\x7f])*"")@(?'domain'((?!-)[a-zA-Z\d\-]+(?<!-)\.)+[a-zA-Z]{2,}|\[(((?(?<!\[)\.)(25[0-5]|2[0-4]\d|[01]?\d?\d)){4}|[a-zA-Z\d\-]*[a-zA-Z\d]:((?=[\x01-\x7f])[^\\\[\]]|\\[\x01-\x7f])+)\])(?'angle')(?(name)>)$"))
                                    {
                                        result.AppendFormat("{0}不是可以识别的Email格式\n", attr.Name);
                                        isCheck = false;
                                    }
                                }
                                break;
                            case ValidateType.IDCard:
                                {
                                    if (string.IsNullOrEmpty(value.ToString())) break;
                                    //这里的身份证验证肯定是要重写，因为这里没有考虑年月日！！！！！！！！！！！
                                    if (Regex.IsMatch(value.ToString(), @"^(\d{15}$|^\d{18}$|^\d{17}(\d|X|x))$"))
                                    {
                                        result.AppendFormat("{0}不是可以识别的身份证号码格式\n", attr.Name);
                                        isCheck = false;
                                    }

                                }
                                break;
                            //对应添加一个类型：FilterHTML
                            case ValidateType.HTML:
                                {
                                    if (string.IsNullOrEmpty(value.ToString())) break;
                                    //这里的身份证验证肯定是要重写，因为这里没有考虑年月日！！！！！！！！！！！
                                    if (!Regex.IsMatch(value.ToString(), @"<(\S*?) [^>]*>.*?</\1>|<.*? />"))
                                    {
                                        result.AppendFormat("{0}不允许包含敏感的字符\n", attr.Name);
                                        isCheck = false;
                                    }
                                }
                                break;
                            case ValidateType.MaxValue:
                                if (Int32.Parse(value.ToString()) > attr.MaxValue)
                                {
                                    result.AppendFormat("{0}超过最大值{1}\n", attr.Name, attr.MaxValue);
                                    isCheck = false;
                                }
                                break;
                            case ValidateType.MinValue:
                                if (Int32.Parse(value.ToString()) < attr.MinValue)
                                {
                                    result.AppendFormat("{0}小于最小值{1}\n", attr.Name, attr.MaxValue);
                                    isCheck = false;
                                }
                                break;
                            //追加Empty过滤
                            case ValidateType.Empty | ValidateType.Email:
                                if (string.IsNullOrEmpty(value + "")) goto case ValidateType.Empty;
                                goto case ValidateType.Email;
                            case ValidateType.Empty | ValidateType.Gender:
                                if (string.IsNullOrEmpty(value + "")) goto case ValidateType.Empty;
                                goto case ValidateType.Gender;
                            case ValidateType.Empty | ValidateType.HTML:
                                if (string.IsNullOrEmpty(value + "")) goto case ValidateType.Empty;
                                goto case ValidateType.HTML;
                            case ValidateType.Empty | ValidateType.IDCard:
                                if (string.IsNullOrEmpty(value + "")) goto case ValidateType.Empty;
                                goto case ValidateType.IDCard;
                            case ValidateType.Empty | ValidateType.Length:
                                if (string.IsNullOrEmpty(value + "")) goto case ValidateType.Empty;
                                goto case ValidateType.Length;
                            case ValidateType.Empty | ValidateType.MaxLength:
                                if (string.IsNullOrEmpty(value + "")) goto case ValidateType.Empty;
                                goto case ValidateType.MaxLength;
                            case ValidateType.Empty | ValidateType.MaxValue:
                                if (string.IsNullOrEmpty(value + "")) goto case ValidateType.Empty;
                                goto case ValidateType.MaxValue;
                            case ValidateType.Empty | ValidateType.MinLength:
                                if (string.IsNullOrEmpty(value + "")) goto case ValidateType.Empty;
                                goto case ValidateType.MinLength;
                            case ValidateType.Empty | ValidateType.MinValue:
                                if (string.IsNullOrEmpty(value + "")) goto case ValidateType.Empty;
                                goto case ValidateType.MinValue;
                            case ValidateType.Empty | ValidateType.Phone:
                                if (string.IsNullOrEmpty(value + "")) goto case ValidateType.Empty;
                                goto case ValidateType.Phone;
                            case ValidateType.Empty | ValidateType.Range:
                                if (string.IsNullOrEmpty(value + "")) goto case ValidateType.Empty;
                                goto case ValidateType.Range;
                            case ValidateType.Empty | ValidateType.Reg:
                                if (string.IsNullOrEmpty(value + "")) goto case ValidateType.Empty;
                                goto case ValidateType.Reg;
                            default:
                                goto case ValidateType.Empty;
                            //userName特性
                            //password特性
                            //对时间范围验证
                            //对字节长度验证
                            //全英文验证
                        }
                    }
                }
            }
            return isCheck;
        }
        #endregion

        #region 将每个对象由SqlDataReader实例化（反射）

        #endregion

        #region 每个对象查询集合方法（支持条件查询）
        #endregion

        #region 每个对象查询单条结果并返回newId方法
        #endregion

        #region 每个对象查询单条结果并返回结果方法
        #endregion

        #region 每个对象新增方法
        #endregion


        #region 每个对象修改方法（反射可以做到？？？最优化的修改，这个方法预留给接口？）
        #endregion

        #region 每个对象删除方法
        #endregion

        //每个对象的isState（删除状态）方法，应该约定为一个接口
    }
}
