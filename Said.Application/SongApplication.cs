using Said.Models;
using Said.Service;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Said.Application
{
    public static class SongApplication
    {
        private static ISongService service;

        public static ISongService Service
        {
            get { return service ?? (service = new SongService(new Domain.Said.Data.DatabaseFactory())); }
        }

        private static int UploadSong(Song song)
        {
            
            return -1;
        }

    }
}
