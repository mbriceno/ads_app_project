import { MigrationInterface, QueryRunner } from "typeorm";

export class CrearTablaAdStats1769024881290 implements MigrationInterface {
    name = 'CrearTablaAdStats1769024881290'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "ad_stats" ("adId" character varying NOT NULL, "impressions" integer NOT NULL DEFAULT '0', "clicks" integer NOT NULL DEFAULT '0', "ctr" double precision NOT NULL DEFAULT '0', CONSTRAINT "PK_76d9500f089fb3cc3b0fc95e174" PRIMARY KEY ("adId"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "ad_stats"`);
    }

}
