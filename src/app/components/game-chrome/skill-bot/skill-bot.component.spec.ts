import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SkillBotComponent } from './skill-bot.component';

describe('SkillBotComponent', () => {
  let component: SkillBotComponent;
  let fixture: ComponentFixture<SkillBotComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SkillBotComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SkillBotComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
