#!/bin/bash
set -e
rm -rf ~/tmp/insight_sign
mkdir -p ~/tmp/insight_sign && cd ~/tmp/insight_sign
git clone https://github.com/slamby/slamby-insight.git
cd slamby-insight
git tag -l
echo -e “Please give a tag from the repository:”
read tag
git checkout tags/$tag

npm install && npm run packager:prepare && npm run packager:osx

codesign --deep --force --verbose --sign E2HUXX545D --signature-size 9400 packager/slambyinsight-darwin-x64/slambyinsight.app/

echo "Signing ready!"

mkdir installer
npm run installer:osx

mkdir -p ~/tmp/insight_sign/$tag

cd packager/slambyinsight-darwin-x64
zip -r -y ~/tmp/insight_sign/$tag/slambyinsight-$tag-osx.zip * 
mv ../../installer/SlambyInsight.dmg ~/tmp/insight_sign/$tag/slambyinsight-$tag-osx.dmg

