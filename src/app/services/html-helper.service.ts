import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class HtmlHelper {
  public getComputedStyleNumericValue(
    element: Element,
    property: string
  ): number {
    var matches = window
      .getComputedStyle(element, null)
      .getPropertyValue(property)
      .match(/\d+/);
    return matches == null ? 0 : parseInt(matches[0]);
  }
}
