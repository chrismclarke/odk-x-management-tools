# Dashboard Settings

A minimally configurable system has been implemented to allow overrides to the default behaviour of ODK-X and restrict access to some specific pages and features.

The current configuration file can be found in [apps/dashboard/src/assets/dashboardSettings.json](../apps/dashboard/src/assets/dashboardSettings.json), and can also be bound to a docker volume to provide overrides when running in a container, see [docker deployment docs](./build-and-deploy-with-docker.md) for more info.

```
   volumes:
     - ./config/dashboard:/usr/share/nginx/html/assets
```

## Specific Overrides

| property                   | type   | description                                                                                        |
| -------------------------- | ------ | -------------------------------------------------------------------------------------------------- |
| EXPORT_TABLE_REQUIRED_ROLE | string | Only allow users with specified role to access table export page. Default `ROLE_SITE_ACCESS_ADMIN` |
