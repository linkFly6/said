namespace Said.Domain.Migrations
{
    using System;
    using System.Data.Entity.Migrations;
    
    public partial class _20160815034843 : DbMigration
    {
        public override void Up()
        {
            DropForeignKey("dbo.BlogTags", new[] { "Tag_TagId", "Tag_TagName" }, "dbo.Tags");
            DropIndex("dbo.BlogTags", new[] { "Tag_TagId", "Tag_TagName" });
            DropColumn("dbo.BlogTags", "TagId");
            RenameColumn(table: "dbo.BlogTags", name: "Tag_TagId", newName: "TagId");
            DropPrimaryKey("dbo.Tags");
            AlterColumn("dbo.BlogTags", "TagId", c => c.String(maxLength: 128));
            AlterColumn("dbo.Tags", "TagName", c => c.String());
            AddPrimaryKey("dbo.Tags", "TagId");
            CreateIndex("dbo.BlogTags", "TagId");
            AddForeignKey("dbo.BlogTags", "TagId", "dbo.Tags", "TagId");
            DropColumn("dbo.BlogTags", "Tag_TagName");
        }
        
        public override void Down()
        {
            AddColumn("dbo.BlogTags", "Tag_TagName", c => c.String(maxLength: 128));
            DropForeignKey("dbo.BlogTags", "TagId", "dbo.Tags");
            DropIndex("dbo.BlogTags", new[] { "TagId" });
            DropPrimaryKey("dbo.Tags");
            AlterColumn("dbo.Tags", "TagName", c => c.String(nullable: false, maxLength: 128));
            AlterColumn("dbo.BlogTags", "TagId", c => c.String());
            AddPrimaryKey("dbo.Tags", new[] { "TagId", "TagName" });
            RenameColumn(table: "dbo.BlogTags", name: "TagId", newName: "Tag_TagId");
            AddColumn("dbo.BlogTags", "TagId", c => c.String());
            CreateIndex("dbo.BlogTags", new[] { "Tag_TagId", "Tag_TagName" });
            AddForeignKey("dbo.BlogTags", new[] { "Tag_TagId", "Tag_TagName" }, "dbo.Tags", new[] { "TagId", "TagName" });
        }
    }
}
