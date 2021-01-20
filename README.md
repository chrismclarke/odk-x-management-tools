# ODK-X Dashboard

## Quick Start & Documentation

This repo provides a custom dashboard that can be used alongside the ODK-X tooling ecosystem.

A preview of the site can be found at:
https://odkx-tools.c2dev.co.uk

### Deploy With Docker
The recommended use is within the existing docker-compose setup for odk-x. This removes the need to provide specific urls for connection, and provides faster database requests.

See [build-and-deploy-with-docker documentation](./documentation/build-and-deploy-with-docker.md) for more information

### Use Standalone
Alternatively, the tool can be deployed standalone. This requires both static site hosting for the app itself, as well as a node server application to handle proxying requests.

See [deploy-standalone documentation](./documentation/deploy-standalone.md) for more information

## About This Project

This dashboard was created to be used as part of a specific project where we are collecting data using ODK-X. The purpose was to make it easier for data managers to view and edit some specific data, and provide additional means to export data.

The project is currently in early beta phases of development, and so may be incomplete, or lacking in features. It is not recommended for production use.
Note, this project is in not endorsed by, and in no way affiliated with ODK. Whilst I do try to be active on the odk-x community forums, for support or feedback related to this dashboard too it is recommended to create an issue on this github repository instead.
