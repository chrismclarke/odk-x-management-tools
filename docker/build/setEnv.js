/**
 *  Populate a json object consisting of required platform settings
 */
function main() {
  const e = process.env;
  const docker_env_json = {
    EXPORT_TABLE_REQUIRED_ROLE: e.EXPORT_TABLE_REQUIRED_ROLE || 'ROLE_SITE_ACCESS_ADMIN',
  };
  return JSON.stringify(docker_env_json);
}
// Log to console so shell can receive output
console.log(main());
