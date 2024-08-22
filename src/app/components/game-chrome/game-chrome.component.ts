import {
  Component,
  ElementRef,
  HostListener,
  ViewChild,
  signal,
} from '@angular/core';

enum Direction {
  None = 0,
  Left = 1,
  Right = 2,
}
@Component({
  selector: 'app-game-chrome',
  standalone: true,
  imports: [],
  templateUrl: './game-chrome.component.html',
  styleUrl: './game-chrome.component.scss',
})
export class GameChromeComponent {
  direction: Direction = Direction.None;
  leftPressed = signal(0);
  rightPressed = signal(0);
  @ViewChild('bar') bar!: ElementRef<HTMLDivElement>;

  @HostListener('window:keydown', ['$event'])
  keyDownEvent(event: KeyboardEvent) {
    switch (event.key) {
      case 'ArrowRight':
        this.rightPressed.set(new Date().getTime());
        break;
      case 'ArrowLeft':
        this.leftPressed.set(new Date().getTime());
        break;
    }
  }

  @HostListener('window:keyup', ['$event'])
  keyUpEvent(event: KeyboardEvent) {
    switch (event.key) {
      case 'ArrowRight':
        this.rightPressed.set(0);
        break;
      case 'ArrowLeft':
        this.leftPressed.set(0);
        break;
    }
  }

  constructor() {
    setInterval(() => {
      if (this.bar) {
        var value = this.getComputedStyleNumericValue(
          this.bar.nativeElement,
          'left'
        );
        var containerSizeValue = this.getComputedStyleNumericValue(
          this.bar.nativeElement.parentElement!,
          'width'
        );
        var barSizeValue = this.getComputedStyleNumericValue(
          this.bar.nativeElement,
          'width'
        );
        if (this.rightPressed() > this.leftPressed()) {
          // move right
          if (value < containerSizeValue - barSizeValue) {
            this.bar.nativeElement.style.left = `${value + 1}px`;
          }
        } else if (this.leftPressed() > this.rightPressed()) {
          // move left
          this.bar.nativeElement.style.left = `${value - 1}px`;
        }
        const items: Array<Element> = [document.getElementById('skill')!];
        for (let i = 0; i < items.length; i++) {
          const item = items[i];
          if (this.isCollide(item, this.bar.nativeElement)) {
            if (!item.classList.contains('hit')) {
              item.classList.add('hit');
            }
          } else {
            if (item.classList.contains('hit')) {
              item.classList.remove('hit');
            }
          }
        }
      }
    }, 1);
  }

  public isCollide(a: Element, b: Element) {
    var aRect = a.getBoundingClientRect();
    var bRect = b.getBoundingClientRect();

    return !(
      aRect.top + aRect.height < bRect.top ||
      aRect.top > bRect.top + bRect.height ||
      aRect.left + aRect.width < bRect.left ||
      aRect.left > bRect.left + bRect.width
    );
  }
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

  public moveRight() {}
  public stopMoveRight() {}
  public moveLeft() {}
  public stopMoveLeft() {}
}
