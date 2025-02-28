// 商品狀態
export enum ProductStatus {
  LIST = 'LIST', // 上架
  UN_LIST = 'UN_LIST', // 下架
}

export enum OrderStatus {
  SUCCESS = 'SUCCESS', //支付成功
  REFUND = 'REFUND', //轉入退款
  NOTPAY = 'NOTPAY', //未支付
  CLOSED = 'CLOSED', //已關關
  REVOKED = 'REVOKED', //已撤銷（付款碼支付）
  USERPAYING = 'USERPAYING', //用戶支付中（付款碼支付）
  PAYERROR = 'PAYERROR', //支付失敗(其他原因，如銀行回傳失敗)
}

// 消費卡類型
export enum CardType {
  TIME = 'time',
  DURATION = 'duration',
}
// 消費卡狀態
export enum CardStatus {
  VALID = 'VALID', // 有效
  EXPIRED = 'EXPIRED', // 過期
  DEPLETE = 'DEPLETE', // 卡片次數使用完畢
}

// 課程表狀態、
export enum ScheduleStatus {
  NO_DO = 'NO_DO', // 未開始
  DOING = 'DOING', // 正在上課中
  FINISH = 'FINISH', // 上完課了
  COMMENTED = 'COMMENTED', // 已評價
  CANCEL = 'CANCEL', // 已取消
}