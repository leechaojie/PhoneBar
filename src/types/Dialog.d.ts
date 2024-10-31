/**
 * 弹框组件
 */
export declare class Dialog {
  /**
   * 设置title
   * @param title
   */
  setTitle(title: string): void;

  /**
   * 设置内容
   * @param content
   */
  setContent(content: string | HTMLElement): void;

  /**
   * 隐藏按钮
   */
  hide(): void;

  /**
   * 显示按钮
   */
  show(): void;
}