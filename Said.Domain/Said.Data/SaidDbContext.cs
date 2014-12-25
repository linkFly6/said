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
            Database.SetInitializer(new DropCreateDatabaseIfModelChanges<SaidDbContext>());
        }

        protected override void OnModelCreating(DbModelBuilder modelBuilder)
        {
            //throw new System.Data.Entity.Infrastructure.UnintentionalCodeFirstException();

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
        public DbSet<Classify> Classify { get; set; }
        public DbSet<Article> Article { get; set; }
        public DbSet<Song> Song { get; set; }
        #endregion
    }
}
