# Build and Deploy with Docker

## Use with ODK-Sync-Endpoint

This dashboard can be used alongside an existing installation of odk-sync-endpoint, using docker. The easiest option is to use the pre-built docker container within an existing `docker-compose` file.

### 1. Add to docker-compose

The dashboard can be included in the docker-compose.yml provided by the [odk-x sync-endpoint-default-setup](https://github.com/odk-x/sync-endpoint-default-setup/blob/master/docker-compose.yml), in the following way:

```
services:
 dashboard:
   image: chrismclarke/odkx-dashboard:latest
   networks:
     - sync-network
   depends_on:
     - sync
   volumes:
     - ./config/dashboard:/usr/share/nginx/html/assets
```

_[source](../docker/docker-compose.yml)_

**Note**, you should ensure that the dashboard is provided on one of the same `networks` as the `odk/sync-endpoint` service (it will make api requests directly ).

Additionally, if you prefer to specify a particular release tag instead of `latest` for the dashboard (e.g. `0.3.0`), you can see the full list of tags on [docker hub](https://hub.docker.com/r/chrismclarke/odkx-dashboard/tags?page=1&ordering=last_updated).

### 2. Update nginx config for dashboard

In order to expose the dashboard on the nginx reverse proxy, an entry should be included in the default [sync-endpoint-locations.conf](https://github.com/odk-x/sync-endpoint-default-setup/blob/master/config/nginx/sync-endpoint-locations.conf)

For example, to make the dashboard service available at the url `/dashboard`:

```
location ^~ /dashboard/ {
 proxy_pass http://dashboard/;
}
```

_[source](../docker/config/nginx/sync-endpoint-locations.conf)_

### 3. (optional) Add volume bindings

If you intend to provide any custom overrides, such as providing a [Custom Fields Display Configuration](./custom-fields-display.md), you should also copy the [dashboard](../docker/config/dashboard) folder to the server and update the volume binding to match local path (e.g. within the existing [config](https://github.com/odk-x/sync-endpoint-default-setup/tree/master/config) folder)

```
   volumes:
     - ./config/dashboard:/usr/share/nginx/html/assets
```

_Ensure the server path `./config/dashboard` exists and populate with `fieldsDisplay.json` if required_

```
  [
    {"tableId":"hidden_table","fieldName":"","hidden":"TRUE","disabled":""},
    {"tableId":"","fieldName":"_id","hidden":"","disabled":"","order":1},
  ]
```

_example `fieldsDisplay.json`_

**Note**, whenever you make changes to files you will need to restart the docker swarm to update the dashboard.

## Manual Build

If for any reason you wish to create a custom docker image for the dashboard, first fork or clone this repo and then run

```

docker build -f docker/DOCKERFILE --tag my-docker-repo-tag .

```

The docker file can be pushed to docker-hub, included in a docker-compose file as above, or run directly via

```

docker run -p 80:80 --name odkx-dashboard --rm my-docker-repo-tag

```
