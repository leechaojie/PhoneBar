export interface IObject<T = any> {
  [key: string]: T;
}

/**
 * 需要修改的坐席状态码
 * @property {3} - 示忙
 * @property {5}- 休息
 * @property {11} - 自定义1
 * @property {12} - 自定义2
 * @property {13} - 自定义3
 * @property {14} - 自定义4
 * @property {15} - 自定义5
 * @property {17} - 自定义7
 */
export type AllowedCustomNotReadyReasonCodes = 3 | 5 | 11 | 12 | 13 | 14 | 15 | 17;

/**
 * 自定义定义未就绪状态名称
 * @property {AllowedCode} code - 需要修改的code码:
 * @property {string} name - 对应的状态名称
 */
export interface CustomNotReadyReason {
  /**
   * 状态码 - 可选值为
   * - 3 : 示忙
   * - 5 : 休息
   * - 11 : 自定义1
   * - 12 : 自定义2
   * - 13 : 自定义3
   * - 14 : 自定义4
   * - 15 : 自定义5
   * - 17 : 自定义7
   */
  code: AllowedCustomNotReadyReasonCodes;

  /**
   * 状态名称
   * 可以任意修改
   */
  name: string;
}

/**
* 按钮名称类型
*/
export type ComponentName =
  /**
   * 打开拨号盘
   */
  | 'openDialPad'
  /**
   * 接听
   */
  | 'answer'
  /**
   * 挂断
   */
  | 'hangup'
  /**
   * 保持
   */
  | 'hold'
  /**
   * 接回
   */
  | 'retrieve'
  /**
   * 转接
   */
  | 'transfer'
  /**
   * 转出
   */
  | 'rollout'
  /**
   * 会议
   */
  | 'conference';
