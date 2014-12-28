using Said.IServices;
using Said.Models;
using Said.Service;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Said.Application
{
    public class BaseApplication<T, S>
        where T : BaseModel
        where S : BaseService<T>
    {
        
    }
}
