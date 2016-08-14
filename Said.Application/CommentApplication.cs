using Said.Service;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Said.Application
{
    public class CommentApplication
    {
        private static ICommentServicee service;
        public static ICommentServicee Context
        {
            get { return service ?? (service = new CommentService(new Domain.Said.Data.DatabaseFactory())); }
        }

    }
}
