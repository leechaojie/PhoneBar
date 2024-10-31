export interface IObject<T = any> {
  [key: string]: T;
}

export declare type DefaultCallbackType = () => void;

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
   * 状态码 {@link AllowedCustomNotReadyReasonCodes}
   * 
   * 可选值为
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


/**
 * 呼叫类型
 * @enum {number} UNKNOWN 0 未知类型：电话方向未知，一般是程序出错导致
 * @enum {number} INTERNAL 1 内部电话
 * @enum {number} INBOUND 2 客户呼入:外部客户来电
 * @enum {number} OUTBOUND 3 手动呼出:坐席外拨去电
 * @enum {number} CONSULT话 4 电话转接:坐席内部咨询电
 * @enum {number} THREEWAY话 5 多方通
 * @enum {number} ORDERCALLBACK呼 6 预约回
 * @enum {number} MANUALCALLBACK访 7 电话回
 * @enum {number} PREDICT呼 8 预测外
 * @enum {number} PREVIEW呼 9 精确预览：预览外
 * @enum {number} WEBCALL 10 网页电话：预留
 * @enum {number} MONITOR 11 电话监听
 */
enum CallType {
  /** 未知类型:电话方向未知，一般是程序出错导致 */
  UNKNOWN = 0,

  /** 内部电话 */
  INTERNAL = 1,

  /** 客户呼入:外部客户来电 */
  INBOUND = 2,

  /** 手动呼出:坐席外拨去电 */
  OUTBOUND = 3,

  /** 电话转接:坐席内部咨询电话 */
  CONSULT = 4,

  /** 多方通话 */
  THREEWAY = 5,

  /** 预约回呼 */
  ORDERCALLBACK = 6,

  /** 电话回访 */
  MANUALCALLBACK = 7,

  /** 预测外呼 */
  PREDICT = 8,

  /** 精确预览:预览外呼 */
  PREVIEW = 9,

  /** 网页电话:预留 */
  WEBCALL = 10,

  /** 电话监听 */
  MONITOR = 11,
};

/**
 * 呼叫参数
 * @param {string} number 电话号码
 * @param {number} id ID
 * @param {number} type 呼叫类型，参考 {@link CallType} 常量
 * @param {string | null} module 手动回拨
 * @param {string | null} call_id 原电话 callId
 * @param {string} queue 队列
 * @param {any} newTransPara 透明参数
 * @param {string | null} taskId 外呼任务id
 * @param {string | null} numberId numberId
 * */
export interface MakeCallOptions {
  /**
   * 电话号码
   */
  number: string;

  /**
   * ID
   * @default -1
   */
  id?: number;

  /**
   * 呼叫类型 {@link CallType}
   * @default 根据号码自动判断
   * @params {number} 0 未知类型：电话方向未知，一般是程序出错导致
   * @params {number} 1 内部电话
   * @params {number} 2 客户呼入：外部客户来电
   * @params {number} 3 手动呼出：坐席外拨去电
   * @params {number} 4 电话转接：坐席内部咨询电话
   * @params {number} 5 多方通话
   * @params {number} 6 预约回呼
   * @params {number} 7 电话回访
   * @params {number} 8 预测外呼
   * @params {number} 9 精确预览：预览外呼
   * @params {number} 10 网页电话：预留 
   * @params {number} 11 电话监听 
   */
  type?: CallType;

  /**
   * 手动回拨
   * @default null
   */
  module?: string | null;

  /**
   * 原电话 callId
   * @default null
   */
  call_id?: string | null;

  /**
   * 队列
   * @default this.agent.defaultQueue
   */
  queue?: string;

  /**
   * 透明参数
   * @default null
   */
  newTransPara?: any;

  /**
   * 外呼任务id
   * @default null
   */
  taskId?: string | null;

  /**
   * numberId
   * @default null
   */
  numberId?: string | null;
}

export interface Contact {
  agentId: string;
  name: string;
}

export interface ShowDialPadOptions {
  title?: string;
  contacts: Contact[];
  btnName: string;
  onDynamicButtonClick: DefaultCallbackType;
  show: boolean;
}