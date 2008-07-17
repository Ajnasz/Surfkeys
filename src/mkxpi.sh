#!/bin/bash

if [ -z $1 ];then
  SFVER='0_5_2a';
else
  SFVER=$1;
fi

echo Creating SurfKeys installation package;
echo Extension jar package chrome.jar;
cd chrome;
echo "delete jar";
rm chrome.jar;
echo Build package surfkeys.jar
zip -r chrome.jar content/* -x \*CVS/\*;
zip -r chrome.jar locale/* -x \*CVS/\*;
zip -r chrome.jar skin/* -x \*CVS/\*;

cd ..;
echo Build package surfkeys.xpi;
rm surfkeys.xpi;
zip surfkeys.xpi chrome.manifest install.rdf chrome/chrome.jar defaults/preferences/prefs.js -x \*CVS/\*;

rm ../downloads/surfkeys_$SFVER.xpi;
cp surfkeys.xpi ../downloads/surfkeys_$SFVER.xpi;
echo Done!
