namespace Said.Domain.Migrations
{
    using System;
    using System.Data.Entity.Migrations;
    
    public partial class _20160814225346 : DbMigration
    {
        public override void Up()
        {
            DropForeignKey("dbo.BlogsTags", "TagId", "dbo.Blogs");
            DropForeignKey("dbo.BlogsTags", "BlogId", "dbo.Tags");
            DropIndex("dbo.BlogsTags", new[] { "TagId" });
            DropIndex("dbo.BlogsTags", new[] { "BlogId" });
            DropPrimaryKey("dbo.Tags");
            AlterColumn("dbo.Tags", "TagName", c => c.String(nullable: false, maxLength: 128));
            AddPrimaryKey("dbo.Tags", new[] { "TagId", "TagName" });
            DropColumn("dbo.Blogs", "BDate");
            DropTable("dbo.BlogsTags");
        }
        
        public override void Down()
        {
            CreateTable(
                "dbo.BlogsTags",
                c => new
                    {
                        TagId = c.String(nullable: false, maxLength: 128),
                        BlogId = c.String(nullable: false, maxLength: 128),
                    })
                .PrimaryKey(t => new { t.TagId, t.BlogId });
            
            AddColumn("dbo.Blogs", "BDate", c => c.DateTime(nullable: false));
            DropPrimaryKey("dbo.Tags");
            AlterColumn("dbo.Tags", "TagName", c => c.String());
            AddPrimaryKey("dbo.Tags", "TagId");
            CreateIndex("dbo.BlogsTags", "BlogId");
            CreateIndex("dbo.BlogsTags", "TagId");
            AddForeignKey("dbo.BlogsTags", "BlogId", "dbo.Tags", "TagId", cascadeDelete: true);
            AddForeignKey("dbo.BlogsTags", "TagId", "dbo.Blogs", "BlogId", cascadeDelete: true);
        }
    }
}
