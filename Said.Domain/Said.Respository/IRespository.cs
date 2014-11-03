using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Said.Domain.Said.Respository
{
    interface IRespository<T>
    {
        int Insert();
        IList<T> Find();
        T Find();
        int Update();
        int Del();
    }
}
