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
        public SaidDbContext()
            : base("name=SaidEntities")
        {
            //关闭延迟加载
            //this.Configuration.LazyLoadingEnabled = false;
            //databaseName是connectionString的name


            /*
                生产环境不要使用这一特性，非常危险，生产环境数据库改变之后请使用“Entity framework数据迁移”
            */
            //Database.SetInitializer(new DropCreateDatabaseIfModelChanges<SaidDbContext>());//每次重新生成Model的时候重置数据库
            Database.SetInitializer<SaidDbContext>(null);

        }

        protected override void OnModelCreating(DbModelBuilder modelBuilder)
        {
            //throw new System.Data.Entity.Infrastructure.UnintentionalCodeFirstException();
            //初始化的时候需要添加测试数据到数据库

            //modelBuilder.Entity<Blog>().HasMany(a => a.Tags).WithMany(t => t.Blogs).Map(m =>
            //{
            //    m.ToTable("BlogsTags"); //中间关系表表名
            //    m.MapLeftKey("TagId"); //设置Activity表在中间表主键名
            //    m.MapRightKey("BlogId"); //设置Trip表在中间表主键名
            //});
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
        public DbSet<User> User { get; set; }
        public DbSet<UserRecord> UserRecord { get; set; }
        public DbSet<Image> Image { get; set; }
        public DbSet<Admin> Admin { get; set; }
        public DbSet<AdminRecord> AdminRecord { get; set; }
        public DbSet<Banner> Banner { get; set; }
        public DbSet<UserLike> UserLike { get; set; }
        public DbSet<Comment> Comment { get; set; }
        public DbSet<Reply> Reply { get; set; }
        public DbSet<BlogTags> BlogTags { get; set; }
        #endregion
    }
}
