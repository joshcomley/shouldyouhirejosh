import { CommonModule } from '@angular/common';
import {
  AfterContentInit,
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  Output,
  ViewChild,
  effect,
  input,
} from '@angular/core';
import { SkillBot } from '../skill-bot';
import { HtmlHelper } from '../../../services/html-helper.service';

@Component({
  selector: 'app-skill-bot',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './skill-bot.component.html',
  styleUrl: './skill-bot.component.scss',
})
export class SkillBotComponent implements AfterContentInit {
  skill = input<SkillBot>(null!);
  xPos = input(0);
  yPos = input(0);
  @ViewChild('self') self!: ElementRef<HTMLElement>;
  @Output() public loaded = new EventEmitter<SkillBotComponent>();
  public hasLoaded: boolean = false;
  constructor(private htmlHelper: HtmlHelper) {
    effect(() => {
      this.self.nativeElement.parentElement!.style.left = `${this.xPos()}px`;
      this.self.nativeElement.parentElement!.style.top = `${this.yPos()}px`;
      this.skill().width = this.htmlHelper.getComputedStyleNumericValue(
        this.self.nativeElement,
        'width'
      );
      this.skill().height = this.htmlHelper.getComputedStyleNumericValue(
        this.self.nativeElement,
        'height'
      );
      if (!this.hasLoaded && this.skill().width > 0) {
        this.hasLoaded = true;
        this.loaded.emit(this);
      }
    });
  }
  ngAfterContentInit(): void {}
}
