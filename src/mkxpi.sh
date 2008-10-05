#!/bin/bash

function cleanBuild {
  if [ -d $BUILD_DIR ]; then
    rm -rf $BUILD_DIR;
  fi
}
function buildXPI {
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

  rm $START_DIR/../downloads/surfkeys_$SFFVER.xpi;
  cp surfkeys.xpi $START_DIR/../downloads/surfkeys_$SFFVER.xpi;
  rm $START_DIR/surfkeys.xpi;
  cp surfkeys.xpi $START_DIR/;

  echo Done!
}
function setVersion {
  if [ `pwd` != $BUILD_DIR ];then
    cd $BUILD_DIR;
  fi
  echo "set version to $SFVER";
  sed "s/###VERSION###/$SFVER/g" install.rdf > install.rdf.tmp;
  mv install.rdf.tmp install.rdf;
}

if [ -z $1 ];then
  SFVER='0.5.2b';
else
  SFVER=$1;
fi

SFFVER=`echo $SFVER | sed 's/\./_/g'`;
START_DIR=`pwd`;
TMP_DIR=/tmp;
BUILD_DIR=$TMP_DIR/surfkeys_$SFVER;

if [ -d $TMP_DIR ];then
  if [ -e $BUILD_DIR ];then
    cleanBuild;
  fi
  echo "Copy current files to temp dir to build package";
  cp -R $START_DIR $BUILD_DIR;
  cd $BUILD_DIR;
  setVersion;
  buildXPI;
  cleanBuild;
  exit 0;
else
  echo "Temp dir not found, exit";
  exit 1;
fi
