import { Controller, Get, Redirect } from '@nestjs/common';

@Controller()
export class EntryController {
  @Get()
  @Redirect('/graphql', 302)
  index() {}
}
