import { Component, Inject, effect, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { GameChromeComponent } from './components/game-chrome/game-chrome.component';
import { MatSlideToggle } from '@angular/material/slide-toggle';
import { FormsModule } from '@angular/forms';
import { DOCUMENT } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, GameChromeComponent, MatSlideToggle, FormsModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  title = 'hirejc';
  darkMode = signal(true);
  constructor(@Inject(DOCUMENT) protected document: Document) {
    effect(() => {
      let body = this.document.getElementsByTagName('html')[0];
      if (this.darkMode()) {
        body.classList.remove('light');
        body.classList.add('dark');
      } else {
        body.classList.remove('dark');
        body.classList.add('light');
      }
    });
  }
}
