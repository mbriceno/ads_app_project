import { Entity, Column, PrimaryColumn } from "typeorm";

@Entity()
export class AdStats {
  @PrimaryColumn()
  adId: string;

  @Column({ default: 0, })
  impressions: number = 0;

  @Column({ default: 0, })
  clicks: number = 0;

  @Column({ default: 0, type: 'float'})
  ctr: number = 0;
}
