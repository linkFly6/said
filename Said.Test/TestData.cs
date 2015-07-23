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
                    ClassifyId = "2e0dfa2f-dca4-4e1a-abeb-889ce98a8bb0",
                    CIcon = "icon-JS.gif",
                    CName = "JavaScript"
                },
                new Classify {
                    ClassifyId = "817aa0f0-447e-46d3-805c-8952c0332df8",
                    CIcon = "icon-CSS3.gif",
                    CName = "CSS"
                }
                ,
                new Classify {
                    ClassifyId = "f6b5ec17-a053-491c-b08e-0368aa115a82",
                    CIcon = "icon-HTML5.gif",
                    CName = "HTML"
                },
                new Classify {
                    ClassifyId = "ac11966d-01bf-4554-bd7e-7e0a807ea8fa",
                    CIcon = "icon-jQuery.gif",
                    CName = "jQuery"
                },
                new Classify {
                    ClassifyId = "271f2924-69ce-4522-8e39-cc8f31059de8",
                    CIcon = "icon-Require.gif",
                    CName = "RequireJS"
                },
                new Classify {
                    ClassifyId = "6198f526-fa0f-4429-983a-bebc8439e7c8",
                    CIcon = "icon-VS.gif",
                    CName = ".NET"
                },
                new Classify {
                    ClassifyId = "d2774f82-3f56-4b0a-b3ae-0ad203cdc510",
                    CIcon = defaultData,
                    CName = "ECMAScript 5"
                },
                new Classify {
                    ClassifyId = "136116aa-a5f6-4f88-bcc4-00a1b4db0dba",
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
                    SongId="106f168f-10f1-4459-918d-f811bc8a7fa6",
                    SongName="Yellow",
                    SongArtist="Coldplay",
                    SongAlbum="Yellow",
                    SongFileName="302320154702223701.mp3",
                    ImageId="098920153702223601.jpg"
                },
                new Song {
                    SongId="97279318-f809-488c-b31c-fe642acb322b",
                    SongName="My Love",
                    SongArtist="Westlife",
                    SongAlbum="Coust To Coust",
                    SongFileName="484720153302224501.mp3",
                    ImageId="107320153502225701.png"
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
