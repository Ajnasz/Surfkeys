#!/bin/bash
########################## Configuration ################################
if [ -z $1 ];then
  SFVER='0.6.2a';
else
  SFVER=$1;
fi
SFFVER=`echo $SFVER | sed 's/\./_/g'`;
START_DIR=`pwd`;
DOWNLOAD_DIR='/var/www/surfkeys/cvs/downloads';
TMP_DIR=/tmp;
BUILD_DIR=$TMP_DIR/surfkeys_$SFVER;
######################## Configuration END ##############################


function cleanBuild {
  if [ -d $BUILD_DIR ];then
    rm -rf $BUILD_DIR;
  fi
}
function buildXPI {
  echo "Creating SurfKeys installation package";
  cd chrome;
  if [ -f surfkeys.jar ];then
    rm surfkeys.jar;
  fi;
  echo "Build package surfkeys.jar";
  zip -r surfkeys.jar content/* -x \*CVS/\*;
  zip -r surfkeys.jar locale/* -x \*CVS/\*;
  zip -r surfkeys.jar skin/* -x \*CVS/\*;

  cd ..;
  echo "Build package surfkeys.xpi";
  rm surfkeys.xpi;
  zip surfkeys.xpi chrome.manifest install.rdf chrome/surfkeys.jar defaults/preferences/prefs.js -x \*CVS/\*;

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
