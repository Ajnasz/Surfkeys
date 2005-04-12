#!/bin/sh

echo Creating SurfKeys installation package
echo Extension jar package surfkeys.jar
cd chrome
rm surfkeys.jar
zip surfkeys.jar content/surfkeys/contents.rdf content/surfkeys/surfkeys.js content/surfkeys/surfkeyssettings.js content/surfkeys/surfkeys.xul content/surfkeys/surfkeys.css content/surfkeys/settings.xul locale/en-US/surfkeys/surfkeys.dtd locale/en-US/surfkeys/contents.rdf skin/classic/surfkeys/icon.png skin/classic/surfkeys/contents.rdf
echo Install package surfkeys.xpi
cd ..
rm ../downloads/surfkeys_$1.xpi
echo Install package hah.xpi
zip ../downloads/surfkeys_$1.xpi chrome/surfkeys.jar install.rdf
echo Done!
