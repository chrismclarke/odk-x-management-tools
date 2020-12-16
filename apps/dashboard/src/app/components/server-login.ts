import { Component, EventEmitter, Output } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { IStorageKey } from '../types';
import { OdkService } from '../services/odk';
import { environment } from '../../environments/environment';

@Component({
  selector: 'odkxm-server-login',
  template: `
    <mat-card style="max-width:700px">
      <form
        *ngIf="credentialsForm"
        class="example-form"
        [formGroup]="credentialsForm"
        (ngSubmit)="connect(credentialsForm.value)"
      >
        <fieldset
          class="form-fields-container"
          [disabled]="(odkService.isConnected | async) === true"
        >
          <div>
            <mat-form-field style="max-width:200px" *ngIf="useApiProxy">
              <mat-label>Server URL</mat-label>
              <input
                matInput
                placeholder="https://..."
                type="url"
                formControlName="serverUrl"
                name="url"
                autocomplete="on"
              />
            </mat-form-field>
            <mat-form-field>
              <mat-label>Username</mat-label>
              <input matInput formControlName="username" autocomplete="on" name="username" />
            </mat-form-field>
            <mat-form-field>
              <mat-label>Password</mat-label>
              <input
                matInput
                formControlName="password"
                type="password"
                name="current-password"
                autocomplete="on"
              />
            </mat-form-field>
          </div>
          <div style="display:flex; align-items:center">
            <mat-checkbox
              formControlName="shouldRemember"
              color="primary"
              (change)="rememberMeChanged()"
            >
              Remember Me
            </mat-checkbox>
            <button
              class="info-button"
              mat-icon-button
              matTooltip="Store the server url, username and password locally in this web browser. This should not be used on public computers"
              matTooltipClass="tooltip"
              aria-label="Store the server url, username and password locally in this web browser. This should not be used on public computers"
            >
              <mat-icon style="font-size:24px">info</mat-icon>
            </button>
          </div>
        </fieldset>
        <div class="form-buttons-container">
          <button
            *ngIf="(odkService.isConnected | async) !== true"
            mat-stroked-button
            color="primary"
            type="submit"
            [disabled]="credentialsForm.invalid || credentialsForm.disabled"
          >
            Connect
          </button>
          <button
            *ngIf="(odkService.isConnected | async) === true"
            mat-stroked-button
            color="primary"
            (click)="disconnect()"
          >
            Disconnect
          </button>
        </div>
      </form>
    </mat-card>
  `,
  styles: [
    `
      form {
        display: flex;
        flex-wrap: wrap;
        padding: 10px;
      }
      .form-fields-container {
        flex: 1;
      }
      .form-buttons-container {
        margin-left: 20px;
      }
      fieldset {
        border: none;
      }
      mat-form-field {
        max-width: 120px;
        width: 100%;
        margin-right: 20px;
      }
      .info-button {
        margin-top: -4px;
        height: 24px;
        width: 40px;
        line-height: 24px;
      }
    `,
  ],
})
export class ServerLoginComponent {
  @Output() connectionChange = new EventEmitter<boolean>();
  credentialsForm: FormGroup;
  storage: Storage = localStorage;
  useApiProxy = environment.useApiProxy;
  constructor(public odkService: OdkService, private fb: FormBuilder, private http: HttpClient) {
    this.initForm();
    console.log('env', environment);
  }

  /**
   * Save credentials and test connection to server by retrieving the
   * base odktables
   * @returns - list of available projects (e.g. [default])
   */
  async connect(formValues: ICredentialsForm) {
    this.credentialsForm.disable();
    const { serverUrl, username, password, shouldRemember } = formValues;
    this.storage = shouldRemember ? localStorage : sessionStorage;
    this.setStorage('odkServerUrl', serverUrl);
    this.setStorage('odkToken', btoa(`${username}:${password}`));
    try {
      await this.odkService.connect();

      this.odkService.serverUrl = serverUrl;
      this.connectionChange.next(this.odkService.isConnected.value);
    } catch (error) {
      this.credentialsForm.enable();
      this.removeStorage('odkToken');
      this.removeStorage('odkServerUrl');
    }
  }
  disconnect() {
    this.initForm();
    this.odkService.disconnect();
    this.connectionChange.next(this.odkService.isConnected.value);
  }

  /** When toggling off remember-me delete any cached credentials */
  public rememberMeChanged() {
    const { shouldRemember } = this.credentialsForm.value;
    if (!shouldRemember) {
      this.removeStorage('odkServerUrl');
      this.removeStorage('odkToken');
      this.credentialsForm.reset();
    }
  }

  /** Build login form and pre-populate with any cached values */
  private async initForm() {
    const serverUrl = this.getStorage('odkServerUrl');
    const token = this.getStorage('odkToken');
    const { username, password } = this.initializeToken(token);
    const isRemembered = this.getStorage('odkServerUrl') ? true : false;
    this.credentialsForm = this.createForm({
      serverUrl: [serverUrl],
      username: [username, Validators.required],
      password: [password, Validators.required],
      shouldRemember: isRemembered,
    });
    if (this.credentialsForm.valid && !this.odkService.isConnected.value) {
      this.connect(this.credentialsForm.value);
    }
  }

  /**
   * Load config file from assets folder
   * Note 1 - populated from assets to allow easy override in docker without build
   * Note 2 - use the angular http client as axios client used by odk is proxied
   */
  private async loadHardcodedConfig() {
    return this.http.get('assets/dashboard.config.json').toPromise();
  }

  private createForm(model: ICredentialsFormModel): FormGroup {
    return this.fb.group(model);
  }

  /**
   * Used in development when token stored to localstorage
   * Extract token back to form creds
   */
  private initializeToken(token: string) {
    return token
      ? {
          username: atob(token).split(':')[0],
          password: atob(token).split(':')[1],
        }
      : { username: '', password: '' };
  }

  private getStorage(key: IStorageKey): string | undefined {
    return this.storage.getItem(key);
  }

  private setStorage(key: IStorageKey, value: string) {
    return this.storage.setItem(key, value);
  }
  private removeStorage(key: IStorageKey) {
    return this.storage.removeItem(key);
  }
}

interface ICredentialsForm {
  serverUrl: string;
  username: string;
  password: string;
  shouldRemember: boolean;
}
type ICredentialsFormModel = { [key in keyof ICredentialsForm]: any };
