import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateTableAdStatsTemp1769025367430 implements MigrationInterface {
    name = 'CreateTableAdStatsTemp1769025367430'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "ad_stats_temp" ("adId" character varying NOT NULL, "impressions" integer NOT NULL DEFAULT '0', "clicks" integer NOT NULL DEFAULT '0', "ctr" double precision NOT NULL DEFAULT '0', CONSTRAINT "PK_ed0fdd31913c0db2da6cd3c0e06" PRIMARY KEY ("adId"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "ad_stats_temp"`);
    }

}
