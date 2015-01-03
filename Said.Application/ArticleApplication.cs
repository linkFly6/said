using Said.Common;
using Said.Models;
using Said.Service;
using System;
using System.Collections;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Said.Application
{
    /// <summary>
    /// 使用静态类为让它变得更加晦涩，如果需要静态类的语法则可以使用单例模式实现
    /// </summary>
    public static class ArticleApplication
    {

        private static IArticleService service;
        public static IArticleService Context
        {
            get { return service ?? (service = new ArticleService(new Domain.Said.Data.DatabaseFactory())); }
        }

        /// <summary>
        /// 添加一篇文章
        /// </summary>
        /// <param name="model"></param>
        /// <returns></returns>
        public static int Add(Article model)
        {
            Context.Add(model);
            return service.Submit();
        }


        #region 逻辑
        /// <summary>
        /// 验证一篇said是否是有效的said，同时矫正Said的数据
        /// </summary>
        /// <param name="model">要验证的model</param>
        /// <returns>返回null表示验证成功，否则返回验证失败的字符串，用,号分割</returns>
        public static string ValidateAndCorrectSubmit(Article model)
        {
            StringBuilder str = new StringBuilder();
            //防止tag有HTML标签，修正
            if (!string.IsNullOrWhiteSpace(model.STag))
                model.STag = HTMLCommon.HTMLTrim(model.STag);

            //修正model数据
            if (string.IsNullOrWhiteSpace(model.SongId))//没有歌曲id则验证歌曲图片是否存在
            {
                if (model.Song != null)
                {
                    model.Song.SongId = Guid.NewGuid().ToString();//创建一个歌曲ID
                    //检测歌曲文件名，没有/不合法 则生成一个新的
                    if (string.IsNullOrWhiteSpace(model.SName) || SongApplication.FindByFileName(model.SName.Trim()) != null)
                        model.Song.SongFileName = FileCommon.CreateFileNameByTime();
                }
            }
            else//如果有歌曲id则检索数据库
            {
                //model.Song = SongApplication.Context.GetById(model.SongId);//检索有没有歌曲信息
                if (SongApplication.Context.GetById(model.SongId) == null)
                    str.Append("歌曲信息不正确(不可获取),");
            }

            if (ClassifyApplication.Context.GetById(model.ClassifyId) == null)
                str.Append("分类信息不正确,");
            foreach (var validateResult in model.Validate())
            {
                //validateResult.MemberNames//这个要搞懂怎么用，或许能让提示信息更全一点
                str.Append(validateResult.ErrorMessage + ",");
            }
            if (str.Length > 0)
                str.Length--;//StringBuilder的length可以用于裁剪字符串？
            else
            {
                //开始矫正数据
                model.SaidId = Guid.NewGuid().ToString();
                //没有文件名或文件名不合法，则生成一个新的文件名
                if (string.IsNullOrWhiteSpace(model.SName) || ArticleApplication.FindByFileName(model.SName.Trim()) != null)
                    model.SName = FileCommon.CreateFileNameByTime();

            }

            return str.Length > 0 ? str.ToString() : null;
        }
        #endregion


        #region 查询
        /// <summary>
        /// 查找
        /// </summary>
        /// <returns></returns>
        public static Article Find(string id)
        {
            return Context.GetById(id);
        }

        /// <summary>
        /// 查找Said的文件名
        /// </summary>
        /// <param name="fileName"></param>
        /// <returns></returns>
        public static Article FindByFileName(string fileName)
        {
            return Context.Get(m => m.SName == fileName);
        }
        #endregion
    }
}
