#!/bin/bash
# This script is used for client building

echo '============= build start ============='
echo ''
echo '    //   ) )                                    '
echo '   ((         ___     ( )  ___   /              '
echo '     \\     //   ) ) / / //   ) /               '
echo '       ) ) //   / / / / //   / /                '
echo '((___ / / ((___( ( / / ((___/ /   @ by linkFly  '
echo ''
echo ''
rm -r ./dist
npm i --dd
npm run build
echo '============= npm build ============='


# 环境检查
gulp_bin=`command -v gulp`

if [ ! "$gulp_bin" -o ]; then
  echo '请全局安装 gulp'
  exit 1
else
  echo "gulp 版本=`$gulp_bin  --version`"
fi


# package.json
cp -r ./package.json ./dist/
cp -r ./package-lock.json ./dist/

# 部署脚本，服务器最终需要执行该脚本进行部署
cp -r ./deploy.sh ./dist/

# copy rebots 协议，防止搜索引擎抓图片等资源
cp -r ./src/rebots.txt ./dist/

# 运行 gulp 任务，将资源进行合并
gulp_bin build

rm -r ./said
rm -r ./said.tar.gz
mv ./dist ./said
tar zcvf said.tar.gz --exclude=.DS_Store said
echo '============= build success ============='