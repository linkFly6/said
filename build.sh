# This script is used for client building

echo '============= deploy start ============='
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
cp -r ./package.json ./dist/
cp -r ./package-lock.json ./dist/
cp -r ./deploy.sh ./dist/
cp -r ./views ./dist
rm -r ./said
rm -r ./said.tar.gz
mv ./dist ./said
tar zcvf said.tar.gz --exclude=.DS_Store said
echo '============= build success ============='