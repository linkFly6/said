using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace Said.Models
{
    public class SaidLogMessage
    {
        public string UserId { get; set; }
        public int IsAdmin { get; set; }
        public string Message { get; set; }

    }
}