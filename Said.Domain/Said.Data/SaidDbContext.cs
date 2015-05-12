using Said.Models;
using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Said.Domain.Said.Data
{
    public class SaidDbContext : DbContext
    {
        public SaidDbContext(string databaseName = "SaidEntities")
            : base(databaseName)
        {
            //databaseName是connectionString的name
            Database.SetInitializer(new DropCreateDatabaseIfModelChanges<SaidDbContext>());//每次重新生成Model的时候重置数据库
        }

        protected override void OnModelCreating(DbModelBuilder modelBuilder)
        {
            //throw new System.Data.Entity.Infrastructure.UnintentionalCodeFirstException();
            //初始化的时候需要添加测试数据到数据库
        }


        #region SaveChanges
        /// <summary>
        /// 保存到数据库中
        /// </summary>
        public virtual int Commit()
        {
            return base.SaveChanges();
        }
        #endregion

        #region 实体
        public DbSet<Blog> Blog { get; set; }
        public DbSet<Classify> Classify { get; set; }
        public DbSet<Article> Article { get; set; }
        public DbSet<Song> Song { get; set; }
        public DbSet<Tag> Tag { get; set; }
        #endregion
    }
}
