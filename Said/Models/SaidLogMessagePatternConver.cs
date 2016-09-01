using log4net.Layout.Pattern;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using log4net.Core;
using System.IO;

namespace Said.Models
{
    public class SaidLogMessagePatternConver : PatternLayoutConverter
    {
        protected override void Convert(TextWriter writer, LoggingEvent loggingEvent)
        {
            if (Option != null) {

            }
        }
    }
}