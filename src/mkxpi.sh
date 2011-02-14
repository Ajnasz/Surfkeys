#!/bin/bash

function cleanBuild {
  if [ -d $BUILD_DIR ];then
    rm -rf $BUILD_DIR;
  fi
}
function buildXPI {
  echo "Creating SurfKeys installation package";
  cd chrome;
  if [ -f chrome.jar ];then
    rm chrome.jar;
  fi;
  echo "Build package surfkeys.jar";
  zip -r chrome.jar content/* -x \*CVS/\*;
  zip -r chrome.jar locale/* -x \*CVS/\*;
  zip -r chrome.jar skin/* -x \*CVS/\*;

  cd ..;
  echo "Build package surfkeys.xpi";
  rm surfkeys.xpi;
  zip surfkeys.xpi chrome.manifest install.rdf chrome/chrome.jar defaults/preferences/prefs.js -x \*CVS/\*;

  echo "Replace old XPIs with the new one";
  if [ -f $DOWNLOAD_DIR/surfkeys_$SFFVER.xpi ];then
    rm $DOWNLOAD_DIR/surfkeys_$SFFVER.xpi;
  fi;
  cp surfkeys.xpi $DOWNLOAD_DIR/surfkeys_$SFFVER.xpi;
  if [ -f $START_DIR/surfkeys.xpi ];then
    rm $START_DIR/surfkeys.xpi;
  fi;
  cp surfkeys.xpi $START_DIR/;
  echo "Build finished!";
}
function setVersion {
  if [ `pwd` != $BUILD_DIR ];then
    cd $BUILD_DIR;
  fi
  echo "Set version to $SFVER";
  sed "s/###VERSION###/$SFVER/g" install.rdf > install.rdf.tmp;
  mv install.rdf.tmp install.rdf;
}

if [ -z $1 ];then
  SFVER='0.6.2';
else
  SFVER=$1;
fi

########################## Configuration ################################
SFFVER=`echo $SFVER | sed 's/\./_/g'`;
START_DIR=`pwd`;
DOWNLOAD_DIR='/var/www/surfkeys/cvs/downloads';
TMP_DIR=/tmp;
BUILD_DIR=$TMP_DIR/surfkeys_$SFVER;

if [ -d $TMP_DIR ];then
  cleanBuild;
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
