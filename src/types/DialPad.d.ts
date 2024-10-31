import { Dialog } from "./Dialog";

/**
 * 拨号盘实例
 */
export declare class DialPad extends Dialog {
  /**
   * 设置号码
   * @param phoneNmuber 号码
   */
  setPhoneNumber(phoneNmuber: string): void;

  /**
   * 获取输入的号码
   */
  getPhoneNumber(): string;
}
