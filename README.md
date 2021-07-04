# Ideas App

A place to store peoples idea in a style of reddit and twitter website

## User Stories

- Authenticate users
- Users can CRUD ideas
- Users can upvote/downvote ideas
- Users can bookmark ideas
- Users can comment ideas
- New Ideas can be seen in realtime

## Stack

- Database - PostgreSQL
- REST API - NestJS
- GraphQL API - NestJS
- Rest Frontend - Angular with ngrx
- GraphQL Frontend - React (native?) with Apollo Client


## Nest Work Step by Step

1. At first I installed the project using Nestjs Cli and followed the documentation

```bash
    $ npm i -g @nestjs/cli
    $ nest new project-name
```
- Remove unnecessary files from the project

```bash
    rm webpack.config.js src/main.hmr.ts
```
- Made the .gitignore file (took the help from (gitignore.io)
- Then made the envioronment variable package.

```bash
    npm install dotenv
    or
    yarn add dotenv
```

- Then made a file called .env into the project. Initialize the port 4000
- Calling the dotenv package to the `main.ts` file

```ts
import 'dotenv/config';  // imported the package
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';

const port = process.env.PORT || 8080;  // made the port

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(port); // pass the port to listen
  Logger.log(`Server running on http://localhost:${port}`, 'Bootstrap' ); // this line
}
bootstrap();

```
2. Secondly, I created the Database connection using postgres. Also added package for ORM

```bash
    yarn add pg typeorm @nestjs/typeorm
```
- After installing the packages, I made a postgres database in my machine.
- For ORM I made a file into the root directory called `ormconfig.json`
- Add this code to that file

```json

{
    "type": "postgres",
    "host": "localhost",
    "port": 5432,
    "username": "postgres",
    "password": "",
    "database": "ideas",
    "synchronize": true,
    "loggin": true,
    "entities": ["./src/**/*.entity.{.ts,.js}", "./dist/**/*.entity.js"]
}


```

- After add this code into the file we have to import Typeorm to the `app.module.ts`

```ts

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm'; // add this line
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [TypeOrmModule.forRoot()], // import here
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

```

- Made a direactory 

```bash
 $ mkdir src/ideas
```

- Make a file called `idea.entity.ts` and add below code

```ts

import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from "typeorm";

@Entity("idea")
export class IdeaEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @CreateDateColumn()
  created: Date;

  @Column("text")
  idea: string;

  @Column("text")
  description: string;
}

```

- Successfully made the data model `idea.entity`.
- Now we will find our (`ideas`) table with the data model (`idea.entity`) in postgres

3. CRUD Operations

- I am going to make a module for idea using nest cli

```bash
    nest g mo idea
```

- now I need to generate controller

```bash 
    nest g controller idea
```

- We need a service for idea 

```bash
    nest g service idea
```

- This three cli command creted 3 files into the project
- Lets open the controller file first `idea.controller.ts`

```ts
    import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
} from "@nestjs/common";
import { IdeaDTO } from "./idea.dto";
import { IdeaService } from "./idea.service";

@Controller("idea")
export class IdeaController {
  constructor(private ideaService: IdeaService) {}

  @Get()
  showAllIdeas() {
    return this.ideaService.showAll();
  }

  @Post()
  createIdea(@Body() data: IdeaDTO) {
    return this.ideaService.create(data);
  }

  @Get(":id")
  readIdea(@Param("id") id: string) {
    return this.ideaService.read(id);
  }

  @Put(":id")
  updateIdea(@Param("id") id: string, @Body() data: Partial<IdeaDTO>) {
    return this.ideaService.update(id, data);
  }

  @Delete(":id")
  destroyIdea(@Param("id") id: string) {
    return this.ideaService.destroy(id);
  }
}

```

- now we have to connect the dependencies to the `idea.module.ts`

```ts
import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm"; // this line
import { IdeaController } from "./idea.controller";
import { IdeaEntity } from "./idea.entity";     // this line
import { IdeaService } from "./idea.service";

@Module({
  imports: [TypeOrmModule.forFeature([IdeaEntity])],  // add this line
  controllers: [IdeaController],
  providers: [IdeaService],
})
export class IdeaModule {}

```

- Finally go to the service file `idea.service.ts`

```ts

import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { IdeaDTO } from "./idea.dto";
import { IdeaEntity } from "./idea.entity";

@Injectable()
export class IdeaService {
  constructor(
    @InjectRepository(IdeaEntity)
    private ideaRepository: Repository<IdeaEntity>
  ) {}

  async showAll() {
    return await this.ideaRepository.find();
  }

  async create(data: IdeaDTO) {
    const idea = await this.ideaRepository.create(data);
    await this.ideaRepository.save(idea);
    return idea;
  }

  async read(id: string) {
    return await this.ideaRepository.findOne({ where: { id } });
  }

  async update(id: string, data: Partial<IdeaDTO>) {
    await this.ideaRepository.update({ id }, data);
    return await this.ideaRepository.findOne({ id });
  }

  async destroy(id: string) {
    await this.ideaRepository.delete({ id });
    return { delete: true };
  }
}


```

- Lets make a file called DTO `idea.dto.ts` and put below code to that file

```ts

export interface IdeaDTO {
  idea: string;
  description: string;
}

```

- Now reopen the `app.module.ts` and add the dependencies to that file

```ts

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { IdeaModule } from './idea/idea.module';  // imported the IdeaModule

@Module({
  imports: [TypeOrmModule.forRoot(), IdeaModule],  // here IdeaModule added
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}


```

4. 

