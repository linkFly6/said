namespace Said.Domain.Migrations
{
    using System;
    using System.Data.Entity.Migrations;
    
    public partial class _20160814225347 : DbMigration
    {
        public override void Up()
        {
            CreateTable(
                "dbo.BlogTags",
                c => new
                    {
                        BlogTagsId = c.String(nullable: false, maxLength: 128),
                        BlogId = c.String(maxLength: 128),
                        TagId = c.String(),
                        IsDel = c.Int(nullable: false),
                        Date = c.DateTime(nullable: false),
                        Tag_TagId = c.String(maxLength: 128),
                        Tag_TagName = c.String(maxLength: 128),
                    })
                .PrimaryKey(t => t.BlogTagsId)
                .ForeignKey("dbo.Blogs", t => t.BlogId)
                .ForeignKey("dbo.Tags", t => new { t.Tag_TagId, t.Tag_TagName })
                .Index(t => t.BlogId)
                .Index(t => new { t.Tag_TagId, t.Tag_TagName });
            
            CreateTable(
                "dbo.Comments",
                c => new
                    {
                        CommentId = c.String(nullable: false, maxLength: 128),
                        BlogId = c.String(maxLength: 128),
                        UserId = c.String(maxLength: 128),
                        SourceContext = c.String(maxLength: 300),
                        Context = c.String(),
                        IsDel = c.Int(nullable: false),
                        Date = c.DateTime(nullable: false),
                    })
                .PrimaryKey(t => t.CommentId)
                .ForeignKey("dbo.Blogs", t => t.BlogId)
                .ForeignKey("dbo.Users", t => t.UserId)
                .Index(t => t.BlogId)
                .Index(t => t.UserId);
            
            CreateTable(
                "dbo.Replies",
                c => new
                    {
                        ReplyId = c.String(nullable: false, maxLength: 128),
                        BlogId = c.String(maxLength: 128),
                        CommentId = c.String(maxLength: 128),
                        UserId = c.String(maxLength: 128),
                        ToReplyId = c.String(maxLength: 128),
                        SourceContext = c.String(maxLength: 300),
                        Context = c.String(),
                        ReplyType = c.Int(nullable: false),
                        IsDel = c.Int(nullable: false),
                        Date = c.DateTime(nullable: false),
                    })
                .PrimaryKey(t => t.ReplyId)
                .ForeignKey("dbo.Blogs", t => t.BlogId)
                .ForeignKey("dbo.Comments", t => t.CommentId)
                .ForeignKey("dbo.Replies", t => t.ToReplyId)
                .ForeignKey("dbo.Users", t => t.UserId)
                .Index(t => t.BlogId)
                .Index(t => t.CommentId)
                .Index(t => t.UserId)
                .Index(t => t.ToReplyId);
            
        }
        
        public override void Down()
        {
            DropForeignKey("dbo.Replies", "UserId", "dbo.Users");
            DropForeignKey("dbo.Replies", "ToReplyId", "dbo.Replies");
            DropForeignKey("dbo.Replies", "CommentId", "dbo.Comments");
            DropForeignKey("dbo.Replies", "BlogId", "dbo.Blogs");
            DropForeignKey("dbo.Comments", "UserId", "dbo.Users");
            DropForeignKey("dbo.Comments", "BlogId", "dbo.Blogs");
            DropForeignKey("dbo.BlogTags", new[] { "Tag_TagId", "Tag_TagName" }, "dbo.Tags");
            DropForeignKey("dbo.BlogTags", "BlogId", "dbo.Blogs");
            DropIndex("dbo.Replies", new[] { "ToReplyId" });
            DropIndex("dbo.Replies", new[] { "UserId" });
            DropIndex("dbo.Replies", new[] { "CommentId" });
            DropIndex("dbo.Replies", new[] { "BlogId" });
            DropIndex("dbo.Comments", new[] { "UserId" });
            DropIndex("dbo.Comments", new[] { "BlogId" });
            DropIndex("dbo.BlogTags", new[] { "Tag_TagId", "Tag_TagName" });
            DropIndex("dbo.BlogTags", new[] { "BlogId" });
            DropTable("dbo.Replies");
            DropTable("dbo.Comments");
            DropTable("dbo.BlogTags");
        }
    }
}
