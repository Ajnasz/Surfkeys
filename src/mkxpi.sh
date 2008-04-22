#!/bin/sh

echo Creating SurfKeys installation package
echo Extension jar package chrome.jar
cd chrome
echo "delete jar";
rm chrome.jar
echo Install package surfkeys.xpi
zip -r chrome.jar content/* -x CVS/*;
zip -r chrome.jar locale/* -x CVS/*;
zip -r chrome.jar skin/* -x CVS/*;

cd ..
rm ../downloads/surfkeys_$1.xpi
echo Install package hah.xpi
rm surfkeys.xpi;
zip surfkeys.xpi chrome.manifest install.rdf chrome/chrome.jar defaults/preferences/prefs.js -x CVS/*
# zip ../downloads/surfkeys_$1.xpi chrome/chrome.jar install.rdf
echo Done!
