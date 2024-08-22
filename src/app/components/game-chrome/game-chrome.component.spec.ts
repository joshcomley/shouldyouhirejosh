import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GameChromeComponent } from './game-chrome.component';

describe('GameChromeComponent', () => {
  let component: GameChromeComponent;
  let fixture: ComponentFixture<GameChromeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GameChromeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GameChromeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
