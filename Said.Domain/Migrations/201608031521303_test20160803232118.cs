namespace Said.Domain.Migrations
{
    using System;
    using System.Data.Entity.Migrations;
    
    public partial class test20160803232118 : DbMigration
    {
        public override void Up()
        {
            CreateTable(
                "dbo.BlogsTags",
                c => new
                    {
                        TagId = c.String(nullable: false, maxLength: 128),
                        BlogId = c.String(nullable: false, maxLength: 128),
                    })
                .PrimaryKey(t => new { t.TagId, t.BlogId })
                .ForeignKey("dbo.Blogs", t => t.TagId, cascadeDelete: true)
                .ForeignKey("dbo.Tags", t => t.BlogId, cascadeDelete: true)
                .Index(t => t.TagId)
                .Index(t => t.BlogId);
            
        }
        
        public override void Down()
        {
            DropForeignKey("dbo.BlogsTags", "BlogId", "dbo.Tags");
            DropForeignKey("dbo.BlogsTags", "TagId", "dbo.Blogs");
            DropIndex("dbo.BlogsTags", new[] { "BlogId" });
            DropIndex("dbo.BlogsTags", new[] { "TagId" });
            DropTable("dbo.BlogsTags");
        }
    }
}
