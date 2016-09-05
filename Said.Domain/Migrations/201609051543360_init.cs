namespace Said.Domain.Migrations
{
    using System;
    using System.Data.Entity.Migrations;

    public partial class init : DbMigration
    {
        public override void Up()
        {
            /*
            2016-09-05 23:48:08  这一次终于将数据库和远程数据库做了数据迁移的关系映射
            远程数据库已经生成完毕并且数据迁移完毕，所以这里不需要再动态Create，而是直接return
            保证了当前Code First和数据库Model是对应的
            如果下次进行Code First Model升级，但是做数据迁移的时候获取不了更新，那么就把这个return给干掉
            */
            return;
            CreateTable(
                "dbo.Admins",
                c => new
                {
                    AdminId = c.String(nullable: false, maxLength: 128),
                    Name = c.String(),
                    Password = c.String(),
                    IsDel = c.Int(nullable: false),
                    Date = c.DateTime(nullable: false),
                })
                .PrimaryKey(t => t.AdminId);

            CreateTable(
                "dbo.AdminRecords",
                c => new
                {
                    AdminRecordId = c.String(nullable: false, maxLength: 128),
                    Description = c.String(),
                    OperationType = c.Int(nullable: false),
                    Rollback = c.String(),
                    UrlReferrer = c.String(),
                    ReferrerAuthority = c.String(),
                    IP = c.String(),
                    Address = c.String(),
                    UserAgent = c.String(),
                    Url = c.String(),
                    AdminId = c.String(maxLength: 128),
                    IsDel = c.Int(nullable: false),
                    Date = c.DateTime(nullable: false),
                })
                .PrimaryKey(t => t.AdminRecordId)
                .ForeignKey("dbo.Admins", t => t.AdminId)
                .Index(t => t.AdminId);

            CreateTable(
                "dbo.Articles",
                c => new
                {
                    SaidId = c.String(nullable: false, maxLength: 128),
                    SXML = c.String(),
                    STitle = c.String(),
                    STag = c.String(),
                    SSummaryTrim = c.String(),
                    SSummary = c.String(),
                    SScript = c.String(),
                    SReprint = c.Boolean(nullable: false),
                    SPV = c.Int(nullable: false),
                    SName = c.String(),
                    SLastCommentUser = c.String(),
                    SLastComment = c.String(),
                    SIsTop = c.Boolean(nullable: false),
                    ImageId = c.String(maxLength: 128),
                    SHTML = c.String(),
                    SJS = c.String(),
                    SCSS = c.String(),
                    SContext = c.String(nullable: false),
                    SComment = c.Int(nullable: false),
                    SClick = c.Int(nullable: false),
                    Password = c.String(),
                    IsPrivate = c.Int(nullable: false),
                    Likes = c.Int(nullable: false),
                    SongId = c.String(maxLength: 128),
                    IsDel = c.Int(nullable: false),
                    Date = c.DateTime(nullable: false),
                })
                .PrimaryKey(t => t.SaidId)
                .ForeignKey("dbo.Images", t => t.ImageId)
                .ForeignKey("dbo.Songs", t => t.SongId)
                .Index(t => t.ImageId)
                .Index(t => t.SongId);

            CreateTable(
                "dbo.Images",
                c => new
                {
                    ImageId = c.String(nullable: false, maxLength: 128),
                    IName = c.String(),
                    IFileName = c.String(),
                    ISize = c.Int(nullable: false),
                    Type = c.Int(nullable: false),
                    UserID = c.String(maxLength: 128),
                    ReferenceCount = c.Int(nullable: false),
                    IsDel = c.Int(nullable: false),
                    Date = c.DateTime(nullable: false),
                })
                .PrimaryKey(t => t.ImageId)
                .ForeignKey("dbo.Users", t => t.UserID)
                .Index(t => t.UserID);

            CreateTable(
                "dbo.Users",
                c => new
                {
                    UserID = c.String(nullable: false, maxLength: 128),
                    EMail = c.String(),
                    Site = c.String(),
                    Name = c.String(),
                    IsSubscribeComments = c.Boolean(nullable: false),
                    Rule = c.Int(nullable: false),
                    SecretKey = c.String(),
                    IsDel = c.Int(nullable: false),
                    Date = c.DateTime(nullable: false),
                })
                .PrimaryKey(t => t.UserID);

            CreateTable(
                "dbo.Songs",
                c => new
                {
                    SongId = c.String(nullable: false, maxLength: 128),
                    SongUrl = c.String(maxLength: 255),
                    SongName = c.String(),
                    SongLikeCount = c.Int(nullable: false),
                    ReferenceCount = c.Int(nullable: false),
                    FileType = c.String(),
                    SongSize = c.Int(nullable: false),
                    SongArtist = c.String(),
                    SongAlbum = c.String(),
                    ReleaseDate = c.DateTime(nullable: false),
                    Duration = c.Int(nullable: false),
                    ImageId = c.String(maxLength: 128),
                    SongFileName = c.String(),
                    IsDel = c.Int(nullable: false),
                    Date = c.DateTime(nullable: false),
                })
                .PrimaryKey(t => t.SongId)
                .ForeignKey("dbo.Images", t => t.ImageId)
                .Index(t => t.ImageId);

            CreateTable(
                "dbo.Banners",
                c => new
                {
                    BannerId = c.String(nullable: false, maxLength: 128),
                    Theme = c.Int(nullable: false),
                    HTML = c.String(),
                    SourceCode = c.String(),
                    Description = c.String(),
                    ImageId = c.String(maxLength: 128),
                    Link = c.String(),
                    IsDel = c.Int(nullable: false),
                    Date = c.DateTime(nullable: false),
                })
                .PrimaryKey(t => t.BannerId)
                .ForeignKey("dbo.Images", t => t.ImageId)
                .Index(t => t.ImageId);

            CreateTable(
                "dbo.Blogs",
                c => new
                {
                    BlogId = c.String(nullable: false, maxLength: 128),
                    BXML = c.String(),
                    BTitle = c.String(),
                    BSummaryTrim = c.String(),
                    BSummary = c.String(),
                    BScript = c.String(),
                    BReprint = c.Boolean(nullable: false),
                    BPV = c.Int(nullable: false),
                    Likes = c.Int(nullable: false),
                    BName = c.String(),
                    BLastCommentUser = c.String(),
                    BLastComment = c.String(),
                    BIsTop = c.Boolean(nullable: false),
                    BImgTrim = c.String(),
                    BImg = c.String(),
                    BHTML = c.String(),
                    BCSS = c.String(),
                    BContext = c.String(nullable: false),
                    BComment = c.Int(nullable: false),
                    BClick = c.Int(nullable: false),
                    ClassifyId = c.String(maxLength: 128),
                    IsDel = c.Int(nullable: false),
                    Date = c.DateTime(nullable: false),
                })
                .PrimaryKey(t => t.BlogId)
                .ForeignKey("dbo.Classifies", t => t.ClassifyId)
                .Index(t => t.ClassifyId);

            CreateTable(
                "dbo.Classifies",
                c => new
                {
                    ClassifyId = c.String(nullable: false, maxLength: 128),
                    CCount = c.Int(nullable: false),
                    CIcon = c.String(),
                    CLastBlogId = c.String(),
                    CLastBlogName = c.String(),
                    CName = c.String(),
                    IsDel = c.Int(nullable: false),
                    Date = c.DateTime(nullable: false),
                })
                .PrimaryKey(t => t.ClassifyId);

            CreateTable(
                "dbo.BlogTags",
                c => new
                {
                    BlogTagsId = c.String(nullable: false, maxLength: 128),
                    BlogId = c.String(maxLength: 128),
                    TagId = c.String(maxLength: 128),
                    IsDel = c.Int(nullable: false),
                    Date = c.DateTime(nullable: false),
                })
                .PrimaryKey(t => t.BlogTagsId)
                .ForeignKey("dbo.Blogs", t => t.BlogId)
                .ForeignKey("dbo.Tags", t => t.TagId)
                .Index(t => t.BlogId)
                .Index(t => t.TagId);

            CreateTable(
                "dbo.Tags",
                c => new
                {
                    TagId = c.String(nullable: false, maxLength: 128),
                    TagName = c.String(),
                    Count = c.Int(nullable: false),
                    IsDel = c.Int(nullable: false),
                    Date = c.DateTime(nullable: false),
                })
                .PrimaryKey(t => t.TagId);

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

            CreateTable(
                "dbo.UserLikes",
                c => new
                {
                    UserLikeId = c.String(nullable: false, maxLength: 128),
                    LikeArticleId = c.String(),
                    LikeType = c.Int(nullable: false),
                    UserId = c.String(),
                    IsDel = c.Int(nullable: false),
                    Date = c.DateTime(nullable: false),
                })
                .PrimaryKey(t => t.UserLikeId);

            CreateTable(
                "dbo.UserRecords",
                c => new
                {
                    UserRecordID = c.Int(nullable: false, identity: true),
                    UserID = c.String(maxLength: 128),
                    SessionID = c.String(),
                    UrlReferrer = c.String(),
                    ReferrerAuthority = c.String(),
                    LocalPath = c.String(),
                    Query = c.String(),
                    OS = c.String(),
                    Browser = c.String(),
                    UserAgent = c.String(),
                    Country = c.String(),
                    Province = c.String(),
                    City = c.String(),
                    IP = c.String(),
                    SpiderName = c.String(),
                    IsFile = c.Boolean(nullable: false),
                    Language = c.String(),
                    Key = c.String(),
                    IsDel = c.Int(nullable: false),
                    Date = c.DateTime(nullable: false),
                })
                .PrimaryKey(t => t.UserRecordID)
                .ForeignKey("dbo.Users", t => t.UserID)
                .Index(t => t.UserID);

        }

        public override void Down()
        {
            DropForeignKey("dbo.UserRecords", "UserID", "dbo.Users");
            DropForeignKey("dbo.Comments", "UserId", "dbo.Users");
            DropForeignKey("dbo.Replies", "UserId", "dbo.Users");
            DropForeignKey("dbo.Replies", "ToReplyId", "dbo.Replies");
            DropForeignKey("dbo.Replies", "CommentId", "dbo.Comments");
            DropForeignKey("dbo.Replies", "BlogId", "dbo.Blogs");
            DropForeignKey("dbo.Comments", "BlogId", "dbo.Blogs");
            DropForeignKey("dbo.BlogTags", "TagId", "dbo.Tags");
            DropForeignKey("dbo.BlogTags", "BlogId", "dbo.Blogs");
            DropForeignKey("dbo.Blogs", "ClassifyId", "dbo.Classifies");
            DropForeignKey("dbo.Banners", "ImageId", "dbo.Images");
            DropForeignKey("dbo.Articles", "SongId", "dbo.Songs");
            DropForeignKey("dbo.Songs", "ImageId", "dbo.Images");
            DropForeignKey("dbo.Articles", "ImageId", "dbo.Images");
            DropForeignKey("dbo.Images", "UserID", "dbo.Users");
            DropForeignKey("dbo.AdminRecords", "AdminId", "dbo.Admins");
            DropIndex("dbo.UserRecords", new[] { "UserID" });
            DropIndex("dbo.Replies", new[] { "ToReplyId" });
            DropIndex("dbo.Replies", new[] { "UserId" });
            DropIndex("dbo.Replies", new[] { "CommentId" });
            DropIndex("dbo.Replies", new[] { "BlogId" });
            DropIndex("dbo.Comments", new[] { "UserId" });
            DropIndex("dbo.Comments", new[] { "BlogId" });
            DropIndex("dbo.BlogTags", new[] { "TagId" });
            DropIndex("dbo.BlogTags", new[] { "BlogId" });
            DropIndex("dbo.Blogs", new[] { "ClassifyId" });
            DropIndex("dbo.Banners", new[] { "ImageId" });
            DropIndex("dbo.Songs", new[] { "ImageId" });
            DropIndex("dbo.Images", new[] { "UserID" });
            DropIndex("dbo.Articles", new[] { "SongId" });
            DropIndex("dbo.Articles", new[] { "ImageId" });
            DropIndex("dbo.AdminRecords", new[] { "AdminId" });
            DropTable("dbo.UserRecords");
            DropTable("dbo.UserLikes");
            DropTable("dbo.Replies");
            DropTable("dbo.Comments");
            DropTable("dbo.Tags");
            DropTable("dbo.BlogTags");
            DropTable("dbo.Classifies");
            DropTable("dbo.Blogs");
            DropTable("dbo.Banners");
            DropTable("dbo.Songs");
            DropTable("dbo.Users");
            DropTable("dbo.Images");
            DropTable("dbo.Articles");
            DropTable("dbo.AdminRecords");
            DropTable("dbo.Admins");
        }
    }
}
