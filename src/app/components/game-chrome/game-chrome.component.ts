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
import { Box } from './box';

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
  spacePressed = signal(0);
  leftPressed = signal(0);
  rightPressed = signal(0);
  xPosition = signal(0);
  laserXPosition = signal(0);
  skills = signal([
    new SkillBot(new Skill('C#', true)),
    new SkillBot(new Skill('PHP', false)),
    new SkillBot(new Skill('.NET', true)),
    new SkillBot(new Skill('Java', false)),
    new SkillBot(new Skill('Dad jokes', true)),
    new SkillBot(new Skill('EF Core', true)),
    new SkillBot(new Skill('SQL', true)),
    new SkillBot(new Skill('JavaScript', true)),
  ]);
  skillsInArena = signal<Array<SkillBot>>([]);
  skillsCaptured = signal<Array<SkillBot>>([]);
  skillsRejected = signal<Array<SkillBot>>([]);
  width = signal(500);
  height = signal(500);
  laserWidth = signal(4);
  laserLength = signal(1000);
  barWidth = signal(50);
  barYPos = signal(10);
  barHeight = signal(6);
  score = signal(0);
  @ViewChild('bar') bar!: ElementRef<HTMLDivElement>;
  @ViewChild('laser') laser!: ElementRef<HTMLDivElement>;

  @HostListener('window:keydown', ['$event'])
  keyDownEvent(event: KeyboardEvent) {
    switch (event.key) {
      case 'ArrowRight':
        this.rightPressed.set(new Date().getTime());
        break;
      case 'ArrowLeft':
        this.leftPressed.set(new Date().getTime());
        break;
      case ' ':
        this.spacePressed.set(new Date().getTime());
        break;
    }
  }

  @HostListener('window:keyup', ['$event'])
  keyUpEvent(event: KeyboardEvent) {
    console.log(event.key);
    switch (event.key) {
      case 'ArrowRight':
        this.rightPressed.set(0);
        break;
      case 'ArrowLeft':
        this.leftPressed.set(0);
        break;
      case ' ':
        this.spacePressed.set(0);
        this.clearLaser();
        break;
    }
  }

  constructor(private htmlHelper: HtmlHelper) {
    effect(() => {
      this.bar.nativeElement.style.left = `${this.xPosition()}px`;
      this.laser.nativeElement.style.left = `${this.laserXPosition()}px`;
    });
    setInterval(() => {
      if (this.bar) {
        var value = this.xPosition();
        var containerSizeValue = this.htmlHelper.getComputedStyleNumericValue(
          this.bar.nativeElement.parentElement!,
          'width'
        );
        var barWidth = this.barWidth();
        let move = 0;
        if (this.rightPressed() > this.leftPressed()) {
          // move right
          if (value < containerSizeValue - barWidth) {
            move = 1;
          }
        } else if (
          this.leftPressed() > this.rightPressed() &&
          this.xPosition() > 0
        ) {
          // move left
          move = -1;
        }

        let items = this.skillsInArena();

        if (move !== 0) {
          this.xPosition.update((v) => v + move);
          for (let i = 0; i < items.length; i++) {
            const item = items[i];
            if (item.locked) {
              const newX = item.xPos + move;
              const reject = newX < 0;
              const capture = newX >= this.width() - item.width;
              if (!reject && !capture) {
                item.xPos = newX;
              }
              if (reject || capture) {
                this.skillsInArena.update((skills) =>
                  skills.filter((f) => f !== item)
                );
                const s = reject ? this.skillsRejected : this.skillsCaptured;
                s.update((skills) => {
                  skills.push(item);
                  return skills;
                });
                this.clearLaser();
              }
            }
          }
        }
        let score = 0;
        this.skillsCaptured().forEach((element) => {
          if (element.skill.good) {
            score++;
          } else {
            score--;
          }
        });
        this.skillsRejected().forEach((element) => {
          if (!element.skill.good) {
            score++;
          }
        });
        this.score.set(score);
        items = this.skillsInArena();
        this.laserXPosition.set(
          this.xPosition() + (this.barWidth() - this.laserWidth()) / 2
        );

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
              this.isBoxCollide(
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
              this.queueLoadNextSkill();
            }
          }
        }
        this.skillsInArena.set(items);
        const laserBox = {
          xPos: this.laserXPosition(),
          yPos: this.height() - this.laserLength() - this.barYPos(),
          width: this.laserWidth(),
          height: this.laserLength() + 15,
        } as Box;
        let newLaserLength = 1000;
        let collidedItem: SkillBot | null = null;
        for (let i = 0; i < items.length; i++) {
          const item = items[i];
          if (item.start) {
            item.tick++;
            if (item.tick === item.slowness) {
              item.yPos++;
              item.tick = 0;
              if (item.yPos > this.height()) {
                item.start = false;
                item.yPos = -(item.height + 5);
                item.xPos = -1;
                this.skillsInArena.update((skills) =>
                  skills.filter((f) => f !== item)
                );
                this.skills.update((skills) => {
                  skills.push(item);
                  return skills;
                });
                this.queueLoadNextSkill();
              }
            }
          }
          if (
            this.isBoxCollide(laserBox, item) &&
            item.yPos + item.height < this.height() - this.barYPos()
          ) {
            const foundLaserLength = this.calculateLaserLength(item); // - 10 - item.height;
            if (foundLaserLength < newLaserLength) {
              newLaserLength = foundLaserLength;
              collidedItem = item;
            }
            if (!this.spacePressed()) {
              item.start = true;
              item.locked = false;
            }
          }
        }
        const lockedItem = items.find((i) => i.locked) ?? collidedItem;
        if (lockedItem && this.spacePressed()) {
          lockedItem.start = false;
          lockedItem.locked = true;
          this.laserLength.set(this.calculateLaserLength(lockedItem));
        }else{
          this.laserLength.set(1000);
        }
      }
    }, 1);
    this.loadNextSkill();
  }

  private calculateLaserLength(item: SkillBot) {
    return this.height() - (item.yPos + this.barYPos() + item.height);
  }
  public clearLaser() {
    this.spacePressed.set(0);
    const items = this.skillsInArena();
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      item.locked = false;
      item.start = true;
    }
  }

  queueTimeout: any = null;
  public queueLoadNextSkill() {
    if (this.queueTimeout == null) {
      this.queueTimeout = setTimeout(() => {
        this.queueTimeout = null;
        this.loadNextSkill();
      }, this.randomIntBetween(50, 800));
    }
  }

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

  public isBoxCollide(aRect: Box, bRect: Box) {
    const aY = aRect.yPos;
    const bY = bRect.yPos;
    const top1 = aY + aRect.height < bY;
    const top2 = aY > bY + bRect.height;
    const horizontal1 = aRect.xPos + aRect.width < bRect.xPos;
    const horizontal2 = aRect.xPos > bRect.xPos + bRect.width;
    const miss = top1 || top2 || horizontal1 || horizontal2;
    const collide = !miss;
    return collide;
  }
}
