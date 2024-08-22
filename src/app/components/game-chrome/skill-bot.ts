import { Skill } from './skill';

export class SkillBot {
  public start: boolean = false;
  public slowness = 4;
  public tick = 0;
  constructor(
    public skill: Skill,
    public xPos: number = -1,
    public yPos: number = -1,
    public width: number = 0,
    public height: number = 0
  ) {}
}
