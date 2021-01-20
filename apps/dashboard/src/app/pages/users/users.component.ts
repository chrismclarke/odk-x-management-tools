import { Component, OnInit } from '@angular/core';
import { OdkService } from '../../services/odk';

@Component({
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss'],
})
export class UsersComponent implements OnInit {
  constructor(public odkService: OdkService) {}

  ngOnInit(): void {
    console.log('hello users', this.odkService.userPriviledges$.value);
  }
}

/* Priviledges

_From Docs_
ROLE_USER – a user who is able to verify their identity.
ROLE_SYNCHRONIZE_TABLES – a user who is able to execute the sync protocol.
ROLE_SUPER_USER_TABLES – a privileged user who can edit all rows, change how rows are visible, and change who has special permission to edit a given row.
ROLE_ADMINISTER_TABLES – a privileged user who can Reset App Server and who can edit all rows, change how rows are visible, and change who has special permission to edit a given row.

_Not in Docs_
AUTH_LDAP
ROLE_DATA_COLLECTOR
ROLE_DATA_OWNER
ROLE_DATA_VIEWER
ROLE_SITE_ACCESS_ADMIN
USER_IS_REGISTERED

===========================================================================

Ldap                          Role
500: site_admins              ROLE_SITE_ACCESS_ADMIN
501: administer_tables        ROLE_ADMINISTER_TABLES
502: super_user_tables        ROLE_SUPER_USER_TABLES
503: synchronize_tables       ROLE_SYNCHRONIZE_TABLES
504: form_managers
505: data_viewers             ROLE_DATA_VIEWER
506: data_collectors          ROLE_DATA_COLLECTOR


_Unassigned_
AUTH_LDAP
ROLE_DATA_OWNER
ROLE_USER
USER_IS_REGISTERED







*/
