import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { IdeaController } from "./idea.controller";
import { IdeaEntity } from "./idea.entity";
import { IdeaService } from "./idea/idea.service";

@Module({
  imports: [TypeOrmModule.forFeature([IdeaEntity])],
  controllers: [IdeaController],
  providers: [IdeaService],
})
export class IdeaModule {}
