import { Component, EventEmitter, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { IStorageKey } from '../types';
import { OdkRestService } from '../services/odkrest.service';

@Component({
  selector: 'odkxm-server-login',
  template: `
    <mat-card style="max-width:700px">
      <form
        class="example-form"
        [formGroup]="credentialsForm"
        (ngSubmit)="connect(credentialsForm.value)"
      >
        <fieldset
          class="form-fields-container"
          [disabled]="(odkRest.isConnected | async) === true"
        >
          <div>
            <mat-form-field style="max-width:200px">
              <mat-label>Server URL</mat-label>
              <input
                matInput
                placeholder="https://..."
                required
                type="url"
                formControlName="serverUrl"
                name="url"
                autocomplete="on"
              />
            </mat-form-field>
            <mat-form-field>
              <mat-label>Username</mat-label>
              <input
                matInput
                formControlName="username"
                autocomplete="on"
                name="username"
              />
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
          <mat-checkbox formControlName="shouldRemember" color="primary">
            Remember Me
          </mat-checkbox>
        </fieldset>
        <div class="form-buttons-container">
          <button
            *ngIf="(odkRest.isConnected | async) !== true"
            mat-stroked-button
            color="primary"
            type="submit"
            [disabled]="credentialsForm.invalid || credentialsForm.disabled"
          >
            Connect
          </button>
          <button
            *ngIf="(odkRest.isConnected | async) === true"
            mat-stroked-button
            color="primary"
            (click)="disconnect()"
            [disabled]="credentialsForm.invalid"
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
    `,
  ],
})
export class ServerLoginComponent {
  @Output() connectionChange = new EventEmitter<boolean>();
  credentialsForm: FormGroup;
  storage: Storage = localStorage;
  constructor(public odkRest: OdkRestService, private fb: FormBuilder) {
    const serverUrl = this.getStorage('odkServerUrl');
    const token = this.getStorage('odkToken');
    const { username, password } = this.initializeToken(token);
    const isRemembered = this.getStorage('odkServerUrl') ? true : false;
    this.credentialsForm = this.createForm({
      serverUrl: [serverUrl, Validators.required],
      username: username,
      password: password,
      shouldRemember: isRemembered,
    });
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
      await this.odkRest.connect();
      this.odkRest.serverUrl = serverUrl;
      this.connectionChange.next(this.odkRest.isConnected.value);
    } catch (error) {
      this.credentialsForm.enable();
    }
  }
  // TODO - rework for new provider
  disconnect() {
    this.storage.removeItem('odkToken');
    this.credentialsForm.reset();
    this.credentialsForm.enable();
    this.odkRest.disconnect();
    this.connectionChange.next(this.odkRest.isConnected.value);
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
}

interface ICredentialsForm {
  serverUrl: string;
  username: string;
  password: string;
  shouldRemember: boolean;
}
type ICredentialsFormModel = { [key in keyof ICredentialsForm]: any };
