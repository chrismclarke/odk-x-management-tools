import { Component, Output, EventEmitter } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Message } from '@odkxm/api-interfaces';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { IStorageKey } from '../types';

@Component({
  selector: 'odkxm-server-login',
  template: `
    <form
      class="example-form"
      [formGroup]="credentialsForm"
      (ngSubmit)="connect(credentialsForm.value)"
    >
      <div class="form-fields-container">
        <mat-form-field>
          <mat-label>Server URL</mat-label>
          <input
            matInput
            placeholder="https://..."
            required
            type="url"
            formControlName="serverUrl"
            autocomplete="url"
          />
        </mat-form-field>
        <mat-form-field>
          <mat-label>Username</mat-label>
          <input matInput formControlName="username" autocomplete="username" />
        </mat-form-field>
        <mat-form-field>
          <mat-label>Password</mat-label>
          <input
            matInput
            formControlName="password"
            type="password"
            autocomplete="current-password"
          />
        </mat-form-field>
      </div>
      <div class="form-buttons-container">
        <button
          *ngIf="!isConnected"
          mat-stroked-button
          color="primary"
          type="submit"
          [disabled]="credentialsForm.invalid || credentialsForm.disabled"
        >
          Connect
        </button>
        <button
          *ngIf="isConnected"
          mat-stroked-button
          color="primary"
          (click)="disconnect()"
          [disabled]="credentialsForm.invalid"
        >
          Disconnect
        </button>
      </div>
    </form>
  `,
  styles: [
    `
      form {
        display: flex;
        flex-wrap: wrap;
        padding: 10px;
        border: 1px solid var(--color-light);
      }
      .form-fields-container {
        flex: 1;
      }
      .form-buttons-container {
        margin-left: 20px;
      }
      mat-form-field {
        max-width: 200px;
        width: 100%;
        margin-left: 10px;
      }
    `
  ]
})
export class ServerLoginComponent {
  isConnected = false;
  credentialsForm: FormGroup;
  storage = environment.production ? sessionStorage : localStorage;
  @Output() connectionChange = new EventEmitter<string[]>();
  constructor(private http: HttpClient, private fb: FormBuilder) {
    const serverUrl = this.getStorage('odkServerUrl');
    const token = this.getStorage('odkToken');
    const { username, password } = this.initializeToken(token);
    this.credentialsForm = this.createForm({
      serverUrl: [serverUrl, Validators.required],
      username: username,
      password: password
    });
  }

  /**
   * Save credentials and test connection to server by retrieving the
   * base odktables
   * @returns - list of available projects (e.g. [default])
   */
  connect(formValues: ICredentialsForm) {
    this.credentialsForm.disable();
    const { serverUrl, username, password } = formValues;
    this.setStorage('odkServerUrl', serverUrl);
    this.setStorage('odkToken', btoa(`${username}:${password}`));
    this.http
      .get<Message>('/odktables')
      .toPromise()
      .then(res => {
        this.isConnected = true;
        this.connectionChange.next(res.data);
      })
      .catch(err => {
        console.error(err);
        this.isConnected = false;
        this.credentialsForm.enable();
      });
  }
  disconnect() {
    this.storage.removeItem('odkToken');
    this.credentialsForm.reset();
    this.credentialsForm.enable();
    this.connectionChange.next([]);
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
          password: atob(token).split(':')[1]
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
}
type ICredentialsFormModel = { [key in keyof ICredentialsForm]: any };
