using Said.Common;
using Said.Models;
using Said.Service;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.RegularExpressions;
using System.Threading.Tasks;

namespace Said.Application
{
    /// <summary>
    /// User处理程序
    /// </summary>
    public static class UserApplication
    {
        private static IUserService service;
        public static IUserService Context
        {
            get { return service ?? (service = new UserService(new Domain.Said.Data.DatabaseFactory())); }
        }

        /// <summary>
        /// 添加一个User
        /// </summary>
        /// <param name="model"></param>
        /// <returns></returns>
        public static int Add(User model)
        {
            Context.Add(model);
            return service.Submit();
        }

        /// <summary>
        /// 修改用户
        /// </summary>
        /// <param name="model"></param>
        /// <returns></returns>
        public static int Update(User model)
        {
            Context.Update(model);
            return service.Submit();
        }


        /// <summary>
        /// 查找User
        /// </summary>
        /// <returns></returns>
        public static User Find(string id)
        {
            return Context.GetById(id);
        }


        /// <summary>
        /// 验证用户是否存在
        /// </summary>
        /// <param name="id"></param>
        /// <returns></returns>
        public static bool Exists(string id)
        {
            return Context.Exists(id);
        }


        /// <summary>
        /// 验证用户是否存在（没有缓存）
        /// </summary>
        /// <param name="id"></param>
        /// <returns></returns>
        public static bool ExistsNoCache(string id)
        {
            return Context.ExistsNoCache(m => m.UserID == id);
        }


        private static Regex regSite = new Regex(@"^((https|http|ftp|rtsp|mms)?://)?(([0-9a-z_!~*'().&=+$%-]+: )?[0-9a-z_!~*'().&=+$%-]+@)?(([0-9]{1,3}\.){3}[0-9]{1,3}|([0-9a-z_!~*'()-]+\.)*([0-9a-z][0-9a-z-]{0,61})?[0-9a-z]\.[a-z]{2,6})(:[0-9]{1,4})?((/?)|(/[0-9a-z_!~*'().;?:@&=+$,%#-]+)+/?)$");
        private static Regex regEmail = new Regex(@"^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+((\.[a-zA-Z0-9_-]{2,3}){1,2})$");



        /// <summary>
        /// 检测用户昵称是否正确（要求value不为null）
        /// </summary>
        /// <param name="value"></param>
        /// <returns></returns>
        public static string CheckNickName(string value)
        {
            if (value.Trim().Length > 20)
            {
                return "昵称不正确，不允许为空和超过20个字符";
            }
            return null;
        }

        /// <summary>
        /// 检测用户站点是否正确（注意，站点允许为空）（要求value不为null）
        /// </summary>
        /// <param name="value"></param>
        /// <returns></returns>
        public static string CheckSite(string value)
        {
            if (value.Trim().Length > 60 || !UrlCommon.CheckUri(value))
            {
                return "用户站点不正确，不允许携带参数和超过60个字符";
            }
            return null;
        }

        /// <summary>
        /// 检测用户Email是否正确（要求value不为null）
        /// </summary>
        /// <param name="value"></param>
        /// <returns></returns>
        public static string CheckEmail(string value)
        {
            if (value.Trim().Length > 60 || !regEmail.IsMatch(value.Trim()))
            {
                return "Email格式不正确，不允许超过60个字符";
            }
            return null;
        }


        /// <summary>
        /// 验证昵称、站点、和Email是否正确
        /// </summary>
        ///<param name="user">包含userId的用户信息</param>
        ///<param name="databaseUser">从数据库中查阅出来，经过修剪处理后的用户信息，如果验证通过，则它是有数据的</param>
        /// <returns>没有错误信息则返回null，否则返回错误信息</returns>
        public static string CheckAndTrimInput(User user, out User databaseUser)
        {
            databaseUser = null;
            string validateResult = null;
            if (!string.IsNullOrWhiteSpace(user.Name))
            {
                validateResult = CheckNickName(user.Name);
                if (validateResult != null) return validateResult;
                user.Name = user.Name.Trim();
            }
            else
                user.Name = null;//标记这次没有数据
            if (!string.IsNullOrWhiteSpace(user.Site))
            {
                validateResult = CheckSite(user.Site);
                if (validateResult != null) return validateResult;
                user.Site = UrlCommon.ResolveHTTPUri(user.Site.Trim());//将URL修正
            }
            else
                user.Site = null;
            if (!string.IsNullOrWhiteSpace(user.EMail))
            {
                validateResult = CheckEmail(user.EMail);
                if (validateResult != null) return validateResult;
                user.EMail = user.EMail.Trim();
            }
            else
                user.EMail = null;
            databaseUser = Find(user.UserID);
            if (databaseUser == null) return "没有找到当前用户信息";
            /**
                当数据库的用户信息没有数据，而这次验证的用户也没有用户数据，则判定当前用户验证失败
                如果数据库有数据，而这次验证的数据没有数据，则不会影响到数据库的数据，所以判定为验证通过
            **/
            if (string.IsNullOrEmpty(databaseUser.Name) && user.Name == null)
            {
                return "用户昵称不允许为空";
            }
            if (string.IsNullOrEmpty(databaseUser.EMail) && user.EMail == null)//这里只需要判断是不是为null即可，因为前面已经修剪了数据
            {
                return "用户邮箱不允许为空";
            }
            //哪个信息有变动，就修改哪个信息，否则采用数据库中默认的信息
            if (user.Name != null && databaseUser.Name != user.Name)
                databaseUser.Name = user.Name;
            //if (user.Site != null && databaseUser.Site != user.Site)
            databaseUser.Site = user.Site == null ? string.Empty : user.Site;//用户站点可以被更新，不能被空的逻辑给占用了，这样会让用户觉得自己修改不了自己的站点
            if (user.EMail != null && databaseUser.EMail != user.EMail)
                databaseUser.EMail = user.EMail;
            //用户角色改变
            if (user.Rule != databaseUser.Rule)
            {
                databaseUser.Rule = user.Rule;
                if (user.SecretKey != null)
                    databaseUser.SecretKey = user.SecretKey;
            }
            return validateResult;
        }
    }
}
