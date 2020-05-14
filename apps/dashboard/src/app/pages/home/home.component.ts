import { Component } from '@angular/core';

@Component({
  selector: 'odkxm-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent {
  projects: string[] = [];
  constructor() {}

  /**
   *  When notified of successful connection via credentials
   *  Use the callback list of projects to load the default project
   */
  onConnectionChange(projects: string[]) {
    this.projects = projects;
    if (projects[0]) {
      this.selectProject(projects[0]);
    }
  }

  selectProject(project: string) {
    console.log('selecting project', project);
  }
}
