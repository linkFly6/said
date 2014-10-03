using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Said.Models.DataExtend
{

    /// <summary>
    /// 实体数据验证枚举（位枚举）
    /// </summary>
    [Flags]
    public enum ValidateType
    {
        /// <summary>
        /// 验证非空（限定String）
        /// </summary>
        Empty = 0x0001,
        /// <summary>
        /// 验证最大值（限定Int32）
        /// </summary>
        MaxValue = 0x0002,
        /// <summary>
        /// 验证最小值（限定Int32）
        /// </summary>
        MinValue = 0x0004,
        /// <summary>
        /// 验证范围（限定数组（数组中的值））
        /// </summary>
        Range = 0x00088,
        /// <summary>
        /// 正则（限定String）
        /// </summary>
        Reg = 0x0008,
        /// <summary>
        /// 长度验证（限定String和Int）
        /// </summary>
        Length = 0x0010,
        /// <summary>
        /// 性别验证（限定Int）
        /// </summary>
        Gender = 0x00086,
        /// <summary>
        /// 手机号码（限定String）
        /// </summary>
        Phone = 0x000F2,
        /// <summary>
        /// Email（限定String）
        /// </summary>
        Email = 0x0020,
        /// <summary>
        /// 身份证（限定String）
        /// </summary>
        IDCard = 0x0040,
        /// <summary>
        /// HTML格式（限定String）
        /// </summary>
        HTML = 0x0080,
        /// <summary>
        /// 最大长度（限定String、Int）
        /// </summary>
        MaxLength = 0x0100,
        /// <summary>
        /// 最小长度（限定String、Int）
        /// </summary>
        MinLength = 0x010A
    }
}
