import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';


/**
  1.在開發中若是某些方式或參數常常需要重覆的去拿，可以透過裝飾器的客制化，將獲取的過程封裝起來
  2.以這裡為例，我們可以做一個專門返回UserId的裝飾器
*/
export const CurUserId = createParamDecorator(
  (_data: unknown, context: ExecutionContext) => {
    //將 ExecutionContext 轉換為 GraphQL 上下文
    const ctx = GqlExecutionContext.create(context);
    //透過ctx.getContext()的方式去獲取被passord封裝進req.user裡的資料
    const userId = ctx.getContext().req.user.id;
    return userId;
  },
);