PROJECT_NAME = 'surfkeys'

# Variables to generate version string
DATESTR = $(shell date '+%g%m%d%H%M%S')
GIT_BRANCH = $(shell git branch | awk '/\*/ {print $$2}')
GIT_SHA = $(shell git log --pretty=%h -n 1)
VERSION = 1.7-$(DATESTR)-$(GIT_BRANCH).$(GIT_SHA)

REPLACE_VERSION_STRING = ___VERSION___
REPLACE_VERSION_FILES = install.rdf
REPLACE_VERSION_FILES += chrome/content/overlay.js

all: clean setversion xpi restore

clean:
	@echo Clean
	@-rm $(PROJECT_NAME)*.xpi

setversion:
	@echo Set version to $(VERSION)
	@for file in $(REPLACE_VERSION_FILES); do \
		cp $${file} $${file}.orig; \
		sed "s/$(REPLACE_VERSION_STRING)/$(VERSION)/g" $${file} > $${file}.tmp; \
		mv $${file}.tmp $${file}; \
	done

xpi:
	@echo Compress files
	@zip -r -q -MM $(PROJECT_NAME)_$(VERSION).xpi \
		chrome.manifest \
		install.rdf \
		modules/Timer.jsm \
		modules/sk.jsm \
		defaults/preferences/$(PROJECT_NAME).js \
		chrome/ \
		license.txt;

restore:
	@echo Restore orignal files
	@for file in $(REPLACE_VERSION_FILES); do mv $${file}.orig $${file}; done

.PHONY: clean setversion restore
