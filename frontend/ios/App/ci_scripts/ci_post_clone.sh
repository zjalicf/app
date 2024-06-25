#!/usr/bin/env bash

set -x
export HOMEBREW_NO_INSTALL_CLEANUP=TRUE
echo "📦 Install CocoaPods"
brew install cocoapods
brew install node@18
brew install autoconf automake libtool
brew link node@18
xcode-select --install
npm install yarn -g
cd ../../../
yarn
yarn generate
yarn sync:ios:production
