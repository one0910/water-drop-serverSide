import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';


/**
  在開發中若是某些方式或參數常常需要重覆的去拿，可以透過裝飾器的客制化，將獲取的過程封裝起來
*/
export const CurOrgId = createParamDecorator(
  (_data: unknown, context: ExecutionContext) => {
    //將 ExecutionContext 轉換為 GraphQL 上下文
    const ctx = GqlExecutionContext.create(context);
    const orgId = ctx.getContext().req.headers.orgid
    return orgId;
  },
);