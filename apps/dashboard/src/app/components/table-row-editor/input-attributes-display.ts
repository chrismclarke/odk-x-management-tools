import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'odkxm-input-attributes-display',
  template: `<div class="attributes-container">
    <div *ngFor="let attribute of attributesList" class="attribute">
      {{ attribute.name }}: {{ attribute.value }}
    </div>
  </div>`,
  styles: [
    `
      .attributes-container {
        opacity: 0.5;
        display: flex;
        flex-wrap: wrap;
        margin-top: 5px;
        font-size: small;
      }
      .attributes-container > div {
        margin-left: 4px;
        padding-left: 4px;
        border-left: 1px solid rgba(0, 0, 0, 0.5);
      }
      .attributes-container > div:first-child {
        margin-left: 0;
        border-left: none;
      }
    `,
  ],
})
/** Simple text box to show input attributes that have been passed to a field (e.g. min/max) */
export class InputAttributesDisplay implements OnInit {
  @Input() inputAttributes: { [name: string]: any };
  attributesList = [];
  constructor() {}

  ngOnInit() {
    this.attributesList = Object.entries(this.inputAttributes).map(([name, value]) => ({
      name,
      value: JSON.stringify(value),
    }));
  }
}
