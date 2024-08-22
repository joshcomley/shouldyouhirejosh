import { Box } from './box';
import { Skill } from './skill';

export class SkillBot implements Box {
  public start: boolean = false;
  public locked: boolean = false;
  public slowness = 3;
  public tick = 0;
  constructor(
    public skill: Skill,
    public xPos: number = -1,
    public yPos: number = -1,
    public width: number = 0,
    public height: number = 0
  ) {}
}
