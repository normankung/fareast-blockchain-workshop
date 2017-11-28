# Docker Compose & run server
echo "//////////////////////////////////"
echo "Docker Compose"
echo "//////////////////////////////////"
cd ../../../
cd artifacts/composeFile
docker-compose -f one-org-solo-couch-dev.yaml up -d
docker-compose -f mongo.yaml up -d