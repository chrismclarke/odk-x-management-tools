export default class ODKXSyncWrapper {
  // TODO - move mapped services here to preserve fidelity
}

/**
 * Source data
 * Sync-endpoint-master\src\main\java\org\opendatakit\aggregate\odktables\api\OdkTables.java
 * More methods in sibling files may also be ported
 *
 *
public interface OdkTables {

  public static final String CURSOR_PARAMETER = "cursor";
  public static final String FETCH_LIMIT = "fetchLimit";


   * Return the JSON serialized list of appNames that this server supports.
   * For ODK Aggregate, this will be a single-element list.
   *
   * @param sc
   * @param req
   * @param httpHeaders
   * @return
   * @throws AppNameMismatchException
   * @throws PermissionDeniedException
   * @throws ODKDatastoreException

  @GET
  @Produces({MediaType.APPLICATION_JSON, ApiConstants.MEDIA_TEXT_XML_UTF8, ApiConstants.MEDIA_APPLICATION_XML_UTF8})
  public Response //AppNameList// getAppNames(@Context ServletContext sc, @Context HttpServletRequest req, @Context HttpHeaders httpHeaders) throws AppNameMismatchException,
      PermissionDeniedException, ODKDatastoreException;

  @GET
  @Path("{appId}/clientVersions")
  @Produces({MediaType.APPLICATION_JSON, ApiConstants.MEDIA_TEXT_XML_UTF8, ApiConstants.MEDIA_APPLICATION_XML_UTF8})
  public Response //ClientVersionList// getOdkClientVersions(@Context ServletContext sc, @Context HttpServletRequest req, @Context HttpHeaders httpHeaders,
      @Context UriInfo info, @PathParam("appId") String appId) throws AppNameMismatchException, PermissionDeniedException, ODKDatastoreException, ODKTaskLockException;

  @GET
  @Path("{appId}/privilegesInfo")
  @Produces({MediaType.APPLICATION_JSON, ApiConstants.MEDIA_TEXT_XML_UTF8, ApiConstants.MEDIA_APPLICATION_XML_UTF8})
  public Response //PrivilegesInfo// getPrivilegesInfo(@Context ServletContext sc, @Context HttpServletRequest req, @Context HttpHeaders httpHeaders,
      @Context UriInfo info, @PathParam("appId") String appId) throws AppNameMismatchException, PermissionDeniedException, ODKDatastoreException, ODKTaskLockException;

  @GET
  @Path("{appId}/usersInfo")
  @Produces({MediaType.APPLICATION_JSON, ApiConstants.MEDIA_TEXT_XML_UTF8, ApiConstants.MEDIA_APPLICATION_XML_UTF8})
  public Response //UserInfoList// getUsersInfo(@Context ServletContext sc, @Context HttpServletRequest req, @Context HttpHeaders httpHeaders,
      @Context UriInfo info, @PathParam("appId") String appId) throws AppNameMismatchException, PermissionDeniedException, ODKDatastoreException, ODKTaskLockException;

  @POST
  @Path("{appId}/installationInfo")
  @Consumes({MediaType.APPLICATION_JSON})
  public Response //OK// postInstallationInfo(@Context ServletContext sc, @Context HttpServletRequest req, @Context HttpHeaders httpHeaders,
      @Context UriInfo info, @PathParam("appId") String appId, Object body) throws AppNameMismatchException, PermissionDeniedException, ODKDatastoreException, ODKTaskLockException;

  @Path("{appId}/manifest")
  public FileManifestServiceImpl getFileManifestService(@Context ServletContext sc, @Context HttpServletRequest req, @Context HttpHeaders httpHeaders,
      @Context UriInfo info, @PathParam("appId") String appId) throws AppNameMismatchException, PermissionDeniedException, ODKDatastoreException, ODKTaskLockException;

  @Path("{appId}/files")
  public FileServiceImpl getFilesService(@Context ServletContext sc, @Context HttpServletRequest req, @Context HttpHeaders httpHeaders,
      @Context UriInfo info, @PathParam("appId") String appId) throws AppNameMismatchException, PermissionDeniedException, ODKDatastoreException, ODKTaskLockException;

  @GET
  @Path("{appId}/tables")
  @Produces({MediaType.APPLICATION_JSON, ApiConstants.MEDIA_TEXT_XML_UTF8, ApiConstants.MEDIA_APPLICATION_XML_UTF8})
  public Response //TableResourceList// getTables(@Context ServletContext sc, @Context HttpServletRequest req, @Context HttpHeaders httpHeaders,
      @Context UriInfo info, @PathParam("appId") String appId, @QueryParam(CURSOR_PARAMETER) String cursor, @QueryParam(FETCH_LIMIT) String fetchLimit) throws AppNameMismatchException,
      PermissionDeniedException, ODKDatastoreException, ODKTaskLockException;

  @Path("{appId}/tables/{tableId}")
  public TableServiceImpl getTablesService(@Context ServletContext sc, @Context HttpServletRequest req, @Context HttpHeaders httpHeaders,
      @Context UriInfo info, @PathParam("appId") String appId, @PathParam("tableId") String tableId) throws AppNameMismatchException, PermissionDeniedException, ODKDatastoreException, ODKTaskLockException;

}

 */
