import {
  Component,
  ElementRef,
  HostListener,
  ViewChild,
  effect,
  signal,
} from '@angular/core';
import { Skill } from './skill';
import { SkillBotComponent } from './skill-bot/skill-bot.component';
import { CommonModule } from '@angular/common';
import { SkillBot } from './skill-bot';
import { HtmlHelper } from '../../services/html-helper.service';

enum Direction {
  None = 0,
  Left = 1,
  Right = 2,
}
@Component({
  selector: 'app-game-chrome',
  standalone: true,
  imports: [CommonModule, SkillBotComponent],
  templateUrl: './game-chrome.component.html',
  styleUrl: './game-chrome.component.scss',
})
export class GameChromeComponent {
  direction: Direction = Direction.None;
  leftPressed = signal(0);
  rightPressed = signal(0);
  xPosition = signal(0);
  skills = signal([
    new SkillBot(new Skill('C#', true)),
    new SkillBot(new Skill('PHP', false)),
    new SkillBot(new Skill('.NET', true)),
    new SkillBot(new Skill('Java', false)),
  ]);
  skillsInArena = signal<Array<SkillBot>>([]);
  skillsCaptured = signal<Array<SkillBot>>([]);
  width = signal(500);
  height = signal(500);
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

  constructor(private htmlHelper: HtmlHelper) {
    effect(() => {
      this.bar.nativeElement.style.left = `${this.xPosition()}px`;
      const items = this.skillsInArena();
      // for (let i = 0; i < items.length; i++) {
      //   const item = items[i];
      // }
    });
    setInterval(() => {
      if (this.bar) {
        var value = this.xPosition();
        var containerSizeValue = this.htmlHelper.getComputedStyleNumericValue(
          this.bar.nativeElement.parentElement!,
          'width'
        );
        var barSizeValue = this.htmlHelper.getComputedStyleNumericValue(
          this.bar.nativeElement,
          'width'
        );
        if (this.rightPressed() > this.leftPressed()) {
          // move right
          if (value < containerSizeValue - barSizeValue) {
            this.xPosition.update((v) => v + 1);
          }
        } else if (
          this.leftPressed() > this.rightPressed() &&
          this.xPosition() > 0
        ) {
          // move left
          this.xPosition.update((v) => v - 1);
        }
        console.log(this.xPosition());
        const items = this.skillsInArena();
        for (let i = 0; i < items.length; i++) {
          const item = items[i];
          if (item.xPos > -1 || item.width === 0) {
            continue;
          }
          const others = items.filter((i) => i !== item);
          const xPosAttempt = this.randomIntBetween(
            0,
            this.width() - item.width
          );
          const newY = -(item.height + 5);
          if (
            others.filter((o) =>
              this.isSkillBotCollide(
                new SkillBot(
                  item.skill,
                  xPosAttempt,
                  newY,
                  item.width,
                  item.height
                ),
                o
              )
            ).length === 0
          ) {
            item.xPos = xPosAttempt;
            item.yPos = newY;
            item.start = true;
            if (this.skills().length !== 0) {
              setTimeout(() => {
                this.loadNextSkill();
              }, this.randomIntBetween(50, 800));
            }
          }

          // event.skill().xPos = this.randomIntBetween(
          //   0,
          //   this.width() - event.skill().width
          // );
          // console.log(event.skill().skill.name + ': ' + event.skill().width);
          // if (this.skillsInArena().length < 5 && this.skills().length > 0) {
          //   this.loadNextSkill();
          // }

          //   if (this.isCollide(item, this.bar.nativeElement)) {
          //     if (!item.classList.contains('hit')) {
          //       item.classList.add('hit');
          //     }
          //   } else {
          //     if (item.classList.contains('hit')) {
          //       item.classList.remove('hit');
          //     }
          //   }
        }
        this.skillsInArena.set(items);
        for (let i = 0; i < items.length; i++) {
          const item = items[i];
          if (item.start) {
            item.tick++;
            if (item.tick === item.slowness) {
              item.yPos++;
              item.tick = 0;
              if (item.yPos > this.height()) {
                item.start = false;
              }
            }
          }
        }
      }
    }, 1);
    this.loadNextSkill();
  }

  public skillLoaded(event: SkillBotComponent) {}

  public loadNextSkill() {
    const skill =
      this.skills()[this.randomIntBetween(0, this.skills().length - 1)];
    this.skillsInArena.update((skills) => {
      skills.push(skill);
      return skills;
    });
    this.skills.update((skills) => {
      return skills.filter((s) => s !== skill);
    });
  }

  public randomIntBetween(min: number, max: number) {
    return Math.floor(Math.random() * (max - min + 1) + min);
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

  public isSkillBotCollide(aRect: SkillBot, bRect: SkillBot) {
    const aY = aRect.yPos + 1000;
    const bY = bRect.yPos + 1000;
    return !(
      aY + aRect.height < bY ||
      aY > bY + bRect.height ||
      aRect.xPos + aRect.width < bRect.xPos ||
      aRect.xPos > bRect.xPos + bRect.width
    );
  }
}
