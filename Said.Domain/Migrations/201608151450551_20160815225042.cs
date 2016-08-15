namespace Said.Domain.Migrations
{
    using System;
    using System.Data.Entity.Migrations;
    
    public partial class _20160815225042 : DbMigration
    {
        public override void Up()
        {
            AddColumn("dbo.Blogs", "Likes", c => c.Int(nullable: false));
        }
        
        public override void Down()
        {
            DropColumn("dbo.Blogs", "Likes");
        }
    }
}
