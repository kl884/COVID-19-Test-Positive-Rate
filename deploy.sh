#!/bin/bash

git pull
cd frontend
npm run build
rm -rf ../backend/build
echo removed old build
mv build ../backend/.
echo moved new build
pm2 restart website