az acr login --name prporegistry
docker build -t prporegistry.azurecr.io/frontend:latest .
docker push prporegistry.azurecr.io/frontend:latest
