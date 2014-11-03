using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Said.Domain.Said.Services
{
    interface IService<T>
    {
        IList<T> Find();
        T One();
        int Insert();
        int Update();
        int Del();
        int Delete();
    }
}
