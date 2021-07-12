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
import "dotenv/config"; // imported the package
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { Logger } from "@nestjs/common";

const port = process.env.PORT || 8080; // made the port

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(port); // pass the port to listen
  Logger.log(`Server running on http://localhost:${port}`, "Bootstrap"); // this line
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
import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm"; // add this line
import { AppController } from "./app.controller";
import { AppService } from "./app.service";

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
import { IdeaEntity } from "./idea.entity"; // this line
import { IdeaService } from "./idea.service";

@Module({
  imports: [TypeOrmModule.forFeature([IdeaEntity])], // add this line
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
import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { IdeaModule } from "./idea/idea.module"; // imported the IdeaModule

@Module({
  imports: [TypeOrmModule.forRoot(), IdeaModule], // here IdeaModule added
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
```

4. Http Error Handling

- we have to make a `shared` folder and a file `http-error.filter.ts`

```bash
mkdir src/shared
touch src/shared/http-error.filter.ts
```

- Now we have to put some code into `http-error.filter.ts` file

```ts
import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
} from "@nestjs/common";

@Catch()
export class HttpErrorFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest();
    const response = ctx.getResponse();

    response.status(404).json({ found: false });
  }
}
```

- lets cut this provider to our `app.module.ts`

```ts
  import { APP_FILTER } from "@nestjs/core";

  providers: [
    AppService,
    {
      provide: APP_FILTER,
      useClass: HttpErrorFilter,
    },
  ],


```

- now we have to add our error handler code to `http-error.filter.ts` file

```ts
const errorResponse = {
  code: status,
  timestamp: new Date().toLocaleDateString(),
  path: request.url,
  method: request.method,
  //message: exception.message.error || exception.message || null,
  message: exception.message || null,
};

Logger.error(
  `${request.method} ${request.url}`,
  JSON.stringify(errorResponse),
  "ExceptionFilter"
);

response.status(404).json(errorResponse);
```

- lets make a separate section for loggin error handling
- at first we need to make file called `logging.interceptor.ts`

```bash
touch src/shared/logging.interceptor.ts
```

- now put the code for watching error to our logger or console

```ts
import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from "@nestjs/common";
import { Observable } from "rxjs";
import { tap } from "rxjs/operators";

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest();
    const method = req.method;
    const url = req.url;
    const now = Date.now();

    return next
      .handle()
      .pipe(
        tap(() =>
          Logger.log(
            `${method} ${url} ${Date.now() - now}ms`,
            context.getClass().name
          )
        )
      );
  }
}
```

- Finally add this `LoggerInterceptor` tor our `app.module.ts` file

```ts

providers: [
    AppService,
    {
      provide: APP_FILTER,
      useClass: HttpErrorFilter,
    },
    {                               // add
      provide: APP_INTERCEPTOR,     // this
      useClass: LoggingInterceptor, // provider
    },                              // in your app.module.ts
  ],

```

6. Validation Error

- Lets validating the service `idea.service.ts`
- do change for `read` method

```ts

  async read(id: string) {
    const idea = await this.ideaRepository.findOne({ where: { id } });
    if (!idea) {
      throw new HttpException("Not found", HttpStatus.NOT_FOUND);
    }
    return idea;
  }

```

- then change for `update` method

```ts

  async update(id: string, data: Partial<IdeaDTO>) {
    const idea = await this.ideaRepository.findOne({ where: { id } });
    if (!idea) {
      throw new HttpException("Not Found", HttpStatus.NOT_FOUND);
    }
    await this.ideaRepository.update({ id }, data);
    return idea;
  }

```

- finally change the `destroy` method

```ts

  async destroy(id: string) {
    const idea = await this.ideaRepository.findOne({ where: { id } });
    if (!idea) {
      throw new HttpException("Not Found", HttpStatus.NOT_FOUND);
    }
    await this.ideaRepository.delete({ id });
    return idea;
  }

```

- lets do some work with `class-transformer` and `class validator`
- for that we need to install this two packages

```bash
npm install class-transformer class-validator

```

- lets make another file in shared folder

```bash

touch src/shared/validation.pipe.ts

```

- now put this code to that `validation.pipe.ts` file. you can find this code in nestjs website docs

```ts
import {
  PipeTransform,
  Injectable,
  ArgumentMetadata,
  BadRequestException,
} from "@nestjs/common";
import { validate } from "class-validator";
import { plainToClass } from "class-transformer";

@Injectable()
export class ValidationPipe implements PipeTransform<any> {
  async transform(value: any, metadata: ArgumentMetadata) {
    // did some change on this line
    const { metatype } = metadata; // amd this line too
    if (!metatype || !this.toValidate(metatype)) {
      return value;
    }
    const object = plainToClass(metatype, value);
    const errors = await validate(object);
    if (errors.length > 0) {
      throw new BadRequestException("Validation failed");
    }
    return value;
  }

  private toValidate(metatype: Function): boolean {
    const types: Function[] = [String, Boolean, Number, Array, Object];
    return !types.includes(metatype);
  }
}
```

- lets wrap this validator to our `DTO` file
- open the `idea.dto.ts` file and make this changes

```ts
import { IsString } from "class-validator";

export class IdeaDTO {
  @IsString()
  idea: string;

  @IsString()
  description: string;
}
```

- lets some extra validation method in `validation.pipe.ts` file

```ts

    if (errors.length > 0) {
      throw new HttpException(
        `Validation failed: ${this.formatErrors(errors)}`,
        HttpStatus.BAD_REQUEST
      );
    }


    private formatErrors(errors: any[]) {
    return errors
      .map((err) => {
        for (let property in err.constraints) {
          return err.constraints[property];
        }
      })
      .join(", ");
    }

    private isEmpty(value: any) {
      if (Object.keys(value).length > 0) {
        return false;
      }
      return true;
    }


```

- now we have to add some extra code for validating the body data of Object
- open the `validation.pipe.ts` file and add this extra code

```ts
if (value instanceof Object && this.isEmpty(value)) {
  throw new HttpException(
    "Validation failed: No body submitted",
    HttpStatus.BAD_REQUEST
  );
}
```

- lets add our validation work to the controller file. open the `idea.controller.ts` file
- change this code

```ts
import {
  UsePipes,
} from "@nestjs/common";

  @Post()
  @UsePipes(new ValidationPipe())
  createIdea(@Body() data: IdeaDTO) {
    return this.ideaService.create(data);
  }

  @Put(":id")
  @UsePipes(new ValidationPipe())
  updateIdea(@Param("id") id: string, @Body() data: Partial<IdeaDTO>) {
    return this.ideaService.update(id, data);
  }

```

- change the `update` method from the service `idea.service.ts`

```ts
  async update(id: string, data: Partial<IdeaDTO>) {
    let idea = await this.ideaRepository.findOne({ where: { id } }); // this line
    if (!idea) {
      throw new HttpException("Not Found", HttpStatus.NOT_FOUND);
    }
    await this.ideaRepository.update({ id }, data);
    idea = await this.ideaRepository.findOne({ where: { id } }); // add this line
    return idea;
  }

```

- add logger to the controller to show the data to the console
- open the file called `idea.controller.ts`

```ts
private logger = new Logger("IdeaController");

  @Post()
  @UsePipes(new ValidationPipe())
  createIdea(@Body() data: IdeaDTO) {
    this.logger.log(JSON.stringify(data)); // add this line
    return this.ideaService.create(data);
  }


  @Put(":id")
  @UsePipes(new ValidationPipe())
  updateIdea(@Param("id") id: string, @Body() data: Partial<IdeaDTO>) {
    this.logger.log(JSON.stringify(data));  // add this line
    return this.ideaService.update(id, data);
  }


```
