using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Said.Models.DataExtend;

namespace Said.Models
{
    public class Said_User
    {
        /// <summary>
        /// 用户ID
        /// </summary>
        [ModelsValidate(ValidateType = ValidateType.Empty)]
        public string User_Id { get; set; }
        /// <summary>
        /// 用户名
        /// </summary>
        [ModelsValidate(ValidateType = ValidateType.Empty)]
        public string User_Name { get; set; }
        /// <summary>
        /// 用户状态
        /// </summary>
        public IsState User_State { get; set; }
        /// <summary>
        /// 用户描述
        /// </summary>
        public string User_Dis { get; set; }
        /// <summary>
        /// 用户Email
        /// </summary>
        public string User_Email { get; set; }
        /// <summary>
        /// 用户性别
        /// </summary>
        public Gender User_Gender { get; set; }
        /// <summary>
        /// 用户签名
        /// </summary>
        [ModelsValidate(ValidateType = ValidateType.MaxLength, MaxValue = 200)]
        public string User_Autograph { get; set; }
        /// <summary>
        /// 用户注册时间
        /// </summary>
        public DateTime User_RegisterDateTime { get; set; }
        /// <summary>
        /// 用户出生日期
        /// </summary>
        public DateTime User_Birthday { get; set; }
        /// <summary>
        /// 用户角色ID
        /// </summary>
        [ModelsValidate(ValidateType = ValidateType.Empty)]
        public string User_RoleId { get; set; }
        /// <summary>
        /// 用户昵称
        /// </summary>
        [ModelsValidate(ValidateType = ValidateType.Empty)]
        public string User_NickName { get; set; }
        /// <summary>
        /// 用户密码
        /// </summary>
        [ModelsValidate(ValidateType = ValidateType.Empty | ValidateType.MaxLength, MaxValue = 16)]
        public string User_Pwd { get; set; }
        /// <summary>
        /// 用户被点击次数
        /// </summary>
        [ModelsValidate(ValidateType = ValidateType.MinValue, MinValue = 0)]
        public int User_ClickRate { get; set; }
        /// <summary>
        /// 用户头像
        /// </summary>
        [ModelsValidate(ValidateType = ValidateType.MaxLength, MaxValue = 100)]
        public string User_HeadImg { get; set; }
    }
}
