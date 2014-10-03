using System;
using System.Collections;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using System.Xml;
using System.Xml.XPath;

namespace Said.XML
{
    public class SaidXML
    {
        /// <summary>
        /// XML文档对象
        /// </summary>
        private XmlDocument XMLDoc { get; set; }
        /// <summary>
        /// XML上一次遍历得到的对象
        /// </summary>
        private XmlNodeList cacheNodeList { get; set; }
        public SaidXML(string xml)
        {
            this.XMLDoc = new XmlDocument();
            this.XMLDoc.Load(xml);
        }

        //需要有一个函数，判定是不是Xpath、xml、属性表达式，节点表达式

        /// <summary>
        /// 判定一个字符串是不是XMLPath
        /// </summary>
        /// <param name="xpath">xPath</param>
        /// <returns></returns>
        public static bool IsXPath(string xpath)
        {
            if (string.IsNullOrEmpty(xpath) || xpath.IndexOf('/') > -1) return false;
            return true;
        }

        public static bool IsXML(string xpath)
        {
            if (string.IsNullOrEmpty(xpath) || (xpath.IndexOf('<') > -1 && xpath.IndexOf('>') > -1)) return true;
            return false;
        }

        /// <summary>
        /// 将一个含有属性的xpath切割出属性名和属性值
        /// </summary>
        /// <param name="xpath"></param>
        /// <returns></returns>
        public static Hashtable GetAttr(string xpath)
        {
            Hashtable result = new Hashtable();
            if (string.IsNullOrEmpty(xpath) || xpath.IndexOf('@') == -1) return null;
            string[] data = xpath.Split('@');

            return result;
        }

        /// <summary>
        /// 静态根据url加载xml对象，根据url获取（需要有另一个根据XML获取方法）
        /// </summary>
        /// <param name="xml"></param>
        /// <returns></returns>
        public static SaidXML Load(string url) { return new SaidXML(url); }

        /// <summary>
        /// 设置字段（非xpath的表达式[即直接选取DOM]查询结果会自动打入cache，下次的遍历操作如果也是非xpath表达式，则优先chche中遍历）
        /// </summary>
        /// <param name="xpath"></param>
        /// <param name="value"></param>
        /// <returns></returns>
        public SaidXML SetField(string xpath, string value)
        {
            XmlNodeList list;
            if (!IsXPath(xpath)) //只有节点名
            {
                if (this.cacheNodeList != null)
                {//有上一次的结果，则从cache开始遍历
                    list = this.cacheNodeList;
                    foreach (XmlElement item in list)
                    {

                    }
                }
                else
                {  //进行普通xpath遍历，结果打入cache
                    list = this.XMLDoc.DocumentElement.SelectNodes("*/" + xpath);
                }


            }
            else
                list = this.XMLDoc.SelectNodes(xpath);
            return this;
        }
        /// <summary>
        /// 插入某一个字段
        /// </summary>
        /// <param name="position"></param>
        /// <param name="field"></param>
        /// <param name="value"></param>
        /// <returns></returns>
        public SaidXML InsertField(string position, string field, string value)
        {
            return this;
        }

        /// <summary>
        /// 获取字段值
        /// </summary>
        /// <param name="xpath"></param>
        /// <returns></returns>
        public string GetValue(string xpath)
        {
            return string.Empty;
        }

        /// <summary>
        /// 获取xml
        /// </summary>
        /// <returns></returns>
        public string GetXML()
        {
            return string.Empty;
        }

        /// <summary>
        /// 清空缓存
        /// </summary>
        /// <returns></returns>
        public SaidXML ClearCache()
        {
            this.cacheNodeList = null;
            return this;
        }
    }
}
