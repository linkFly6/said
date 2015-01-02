using Said.Application;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Said.Models;

namespace Said.Test
{
    public class TestData
    {
        #region 初始化Classify测试数据
        public IList<Classify> InitClassifyData()
        {
            var defaultData = "icon-Web.png";
            var models = new List<Classify> { 
                new Classify {
                    ClassifyId = Guid.NewGuid().ToString(),
                    CIcon = "icon-JS.gif",
                    CName = "JavaScript"
                },
                new Classify {
                    ClassifyId = Guid.NewGuid().ToString(),
                    CIcon = "icon-CSS3.gif",
                    CName = "CSS"
                }
                ,
                new Classify {
                    ClassifyId = Guid.NewGuid().ToString(),
                    CIcon = "icon-HTML5.gif",
                    CName = "HTML"
                },
                new Classify {
                    ClassifyId = Guid.NewGuid().ToString(),
                    CIcon = "icon-jQuery.gif",
                    CName = "jQuery"
                },
                new Classify {
                    ClassifyId = Guid.NewGuid().ToString(),
                    CIcon = "icon-Require.gif",
                    CName = "RequireJS"
                },
                new Classify {
                    ClassifyId = Guid.NewGuid().ToString(),
                    CIcon = "icon-VS.gif",
                    CName = ".NET"
                },
                new Classify {
                    ClassifyId = Guid.NewGuid().ToString(),
                    CIcon = defaultData,
                    CName = "ECMAScript 5"
                },
                new Classify {
                    ClassifyId = Guid.NewGuid().ToString(),
                    CIcon = "icon-JS.gif",
                    CName = "ECMAScript 6"
                }
            };
            Console.WriteLine("======================正在添加Classify数据======================");
            for (int i = 0, len = models.Count; i < len; i++)
            {
                Console.WriteLine("\r{0}添加类型 - {1}，ID - {2}", i, models[i].CName, models[i].ClassifyId);
                ClassifyApplication.Add(models[i]);
            }
            Console.WriteLine("======================Classify数据添加完毕======================");
            return models;
        }

        #endregion


        #region 初始化Song测试数据
        public IList<Song> InitSongData()
        {
            var models = new List<Song> { 
                new Song {
                    SongId=Guid.NewGuid().ToString(),
                    SongName="Yellow",
                    SongArtist="Coldplay",
                    SongAlbum="Yellow",
                    SongFileName="302320154702223701.mp3",
                    SongImg="098920153702223601.jpg"
                },
                new Song {
                    SongId=Guid.NewGuid().ToString(),
                    SongName="My Love",
                    SongArtist="Westlife",
                    SongAlbum="Coust To Coust",
                    SongFileName="484720153302224501.mp3",
                    SongImg="107320153502225701.png"
                }
            };
            Console.WriteLine("======================正在添加Song数据======================");
            for (int i = 0, len = models.Count; i < len; i++)
            {
                Console.WriteLine("\r{0}添加歌曲 - {1}-{2}，ID - {3}", i, models[i].SongName, models[i].SongArtist, models[i].SongId);
                SongApplication.Add(models[i]);
            }
            Console.WriteLine("======================Song数据添加完毕======================");
            return models;
        }
        #endregion
    }
}
