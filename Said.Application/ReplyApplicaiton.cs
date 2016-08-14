using Said.Service;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Said.Application
{
    public class ReplyApplicaiton
    {
        private static IReplyService service;
        public static IReplyService Context
        {
            get { return service ?? (service = new ReplyService(new Domain.Said.Data.DatabaseFactory())); }
        }
    }
}
