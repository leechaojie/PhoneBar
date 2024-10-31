import EventEmitter from "eventemitter3";

/**
 * 按钮实例
 */
declare class PhoneBarButton extends EventEmitter {
  /**
   * id
   */
  readonly id: string;

  /**
   * 状态
   */
  readonly rootNode: HTMLLIElement;

  /**
   * 隐藏按钮
   */
  hide(): void;

  /**
   * 显示按钮
   */
  show(): void;

  /**
   * 启用按钮
   */
  enable(): void;

  /**
   * 禁用按钮
   */
  disable(): void;
}

export default PhoneBarButton;
