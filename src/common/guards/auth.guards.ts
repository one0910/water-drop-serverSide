import { ExecutionContext, Injectable } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
/**
 1.AuthGuard('jwt') 是 @nestjs/passport 提供的預設守衛，用於基於 JWT 驗證請求。
 2.在 REST API 中，AuthGuard('jwt') 直接從 req 中提取請求頭並驗證 Token。
 3.GqlAuthGuard 用於需要基於 Token 驗證的 GraphQL 查詢或變更，保護 API 的安全性
*/

export class GqlAuthGuard extends AuthGuard('jwt') {
  getRequest(context: ExecutionContext) {
    /**
    由於在 GraphQL中，ExecutionContext與一般的REST的Request是不同的，所以需要另外轉換
    因此可用Next專用的GqlExecutionContext.create(context)方法來做轉換，然後提取HTTP 請求物件（req），
    要這樣轉換的目的主要是要謁主要目的是讓AuthGuard能夠在 GraphQL 環境中正常工作。
    */
    const ctx = GqlExecutionContext.create(context);
    /**
    *GraphQL 的請求資訊（如 Headers、Session）通常被封裝在 context 的 req 屬性中。
    *通過 ctx.getContext().req 提取 HTTP 請求物件，讓AuthGuard可以訪問JWT Token。
    */
    return ctx.getContext().req;
  }
}