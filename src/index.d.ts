/// <reference lib="dom"/>

import AgentApi from "./types/agentApi";
import PhoneBarButton from "./types/phoneBarButton";
import { IObject, CustomNotReadyReason, ComponentName } from "./types/interface";

declare class PhoneBar {
  constructor(options: PhoneBar.Options);

  /**
   * 属性配置
   */
  readonly options: PhoneBar.Options;

  /**
   * AgentApi对象
   * @readonly
   * 此对象用于调用AgentApi接口
   */
  readonly agentApi: AgentApi;

  /**
   * 根据名称获取组件
   * @param {ComponentName} componentName 按钮名称
   */
  getComponent(componentName: ComponentName): PhoneBarButton | null;

  /**
   * 主动拨打呼叫
   * @param {String} number
   */
  makeCall(number: string): void;

  /**
   * 接听呼叫
   */
  answerCall(): void;

  /**
   * 接听排队中呼叫
   * @param {String} callId 主叫id
   * @param {String} thisQueue 所在技能组
   */
  answerCallByQueue(callId: string, thisQueue: string): void;

  /**
   * 转接事件处理
   * @param type 转接类型，可选值为：
   * - `outside`: 转外线号码
   * - `group`: 转技能组
   * - `ivr`: 转IVR
   * - `key`: 转按键采集
   * - `satisfaction`: 转满意度
   */
  transferHandler(type: string, id: string): void;

  /**
   * 更新会议下拉菜单选项
   */
  updateConferenceMenu(): void;

  /**
   * 当会议菜单选项被点击时的事件处理函数
   * @param val 选中菜单的数据
   */
  onConferenceItemClick(val: IObject): void;


  /**
   * 更新坐席排队信息
   * @public
   * 可以在点击排队列表时更新
   */
  updateQueueInfo(): void;

  /**
   * 转外线
   * @private
   * @param num 转外线的号码 
   */
  _transferThis(num?: string): void;

  /**
   * 显示多方通话弹出框
   * @private
   */
  _showThreewayCallBox(): void;

  /**
   * 显示拨号盘
   * @private
   */
  _showDialPad(): void;

  /**
   * 请求转接坐席数据
   * 
   * 向 CTI 服务器发送请求
   * @param limitAgent 查询座席名字或账号
   * @param state 查询状态
   * @param queueCode 查询技能组
   * @param grpStreamNumber 查询班组
   */
  requestTransferAgentData(limitAgent?: string, state?: string, queueCode?: string, grpStreamNumber?: string): void

  /**
   * 请求技能组列表
   * 
   * 向 CTI 服务器发送请求
   */
  requestSkillList(): void

  /**
   * 请求会议数据
   * 
   * 向 CTI 服务器发送请求
   * @param limitAgent 查询座席名字或账号
   * @param state 查询状态
   * @param queueCode 查询技能组
   * @param grpStreamNumber 查询班组
   */
  requestConferenceData(limitAgent?: string, state?: string, queueCode?: string, grpStreamNumber?: string): void

  /**
   * 销毁组件
   *
   * @remarks
   * 删除页面上显示的电话条元素、绑定的事件和断开与CTI服务器的连接
   */
  destroy(): void;

  /**
   * 工具库
   */
  static utils: {
    /**
     * 提示消息
     * @param msg 消息内容
     *
     * 缺省插件以 alert 方式弹出，用户可以覆盖的弹窗方法。提示消息默认使用 alert
     */
    showMessage(msg: string): void;

    /**
     * 验证号码是否合法
     * @param num
     * @returns {boolean}
     */
    checkPhoneNumber(num: number | string): boolean;

    /**
     * json转url参数
     * @param param
     * @returns {string}
     */
    parseParam(param: IObject): string;
    isFunction(f: any): boolean;
    firstUpperCase(str: string): any;
    trim(str: string): any;
  };

  /**
   * 日志打印类，用于用户复写后自定义显示
   */
  static Log: {
    /**
     * 基础日志
     * @param message 日志消息
     * @param args
     */
    log(message: string, ...args: any[]): void;

    /**
     * 信息日志
     * @param message 日志消息
     * @param args
     */
    info(message: string, ...args: any[]): void;

    /**
     * 错误日志
     * @param message 日志消息
     * @param args
     */
    error(message: string, ...args: any[]): void;
  };
}

declare namespace PhoneBar {
  interface Options {
    /**
     * 渲染容器
     *
     * @remarks
     * 页面元素id，电话条渲染到当前元素内，默认追加到body内。new PhoneBar 前需保证 DOM元素 已存在
     */
    renderTo: string;

    /**
     * CTI 服务器地址
     */
    proxyUrl: string;

    /**
     * SIP服务地址
     */
    sipServerUrl?: string;

    /**
     * 是否自动启动软电话
     *
     * 如果自动启动请配置软电话服务地址
     */
    startupSoftPhone: boolean;

    /**
     * 调试消息
     * 
     * @default false
     * 请注意，输出可能非常详细，并且可能包含敏感信息（如密码、令牌等）。
     */
    debug?: boolean;

    /**
     * 开启系统日志
     * 
     * @default true
     * 控制台打印话条日志。
     */
    log?: boolean;

    /**
     * 账号
     */
    username: string;

    /**
     * token
     */
    token: string;

    /**
     * 租户ID
     */
    tid: string;

    /**
     * 分机号 与坐席工号一致
     */
    thisDN: string;

    /**
     * PSTN号码 可以为null
     */
    pstnDN: string | null;

    /**
     * 坐席工号 与分机号一致
     */
    agentID: string;

    /**
     * 密码
     */
    password: string;

    /**
     * 密码类型 默认不加密
     *
     * @remarks
     * 0 不加密;
     * 1 普通加密;
     * 2 随机码混淆加密;
     */
    loginType?: number;

    /**
     * 所在技能组
     *
     * @remarks
     * 格式如：[100018000,100018001] 或 [100019000]
     *
     * 当 defaultQueue = 1 时可以为空
     */
    thisQueues: string[];

    /**
     * 默认技能组
     *
     * @remarks
     * 默认值 "1" 不等于 "1" 时值必须是 thisQueues 数组中的其中一个
     */
    defaultQueue: string;

    /**
     * 通话后自动置闲
     *
     * @remarks
     * null 使用服务端配置 true 开启 false 关闭
     */
    autoIdleWhenAfterWork?: boolean | null;

    /**
     * 登录后自动置闲
     */
    autoIdleWhenLogin?: boolean;

    /**
     * 是否手机随行 即手机在线
     */
    isPhoneTakeAlong?: boolean;

    /**
     * 随行手机号
     */
    workPhone?: string;

    /**
     * 自动应答 软电话协议预留
     */
    autoAnswer?: boolean;

    /**
     * 自定义状态 
     * 可修改状态名称，以及扩展自定义状态
     * @property {3} - 示忙
     * @property {5}- 休息
     * @property {11} - 自定义1
     * @property {12} - 自定义2
     * @property {13} - 自定义3
     * @property {14} - 自定义4
     * @property {15} - 自定义5
     * @property {17} - 自定义7
     */
    customNotReadyReason?: CustomNotReadyReason[];

    /**
     * 坐席状态变更事件
     * @param newState 坐席当前状态值
     * @param beforeValue 变更前的状态值
     */
    onAgentStatusChange?: (newState: string, beforeValue: string) => void;

    /**
     * 弹屏事件
     * @param lineState 当前线路状态值
     * @param callInfo 通话信息
     */
    onScreenPopup?: (lineState: string, callInfo: IObject) => void;

    /**
     * 振铃事件
     * @param {Object} callInfo 通话信息
     */
    onRinging?: (callInfo: IObject) => void;

    /**
     * 接通事件
     * @param {Object} callInfo 通话信息
     */
    onTalking?: (callInfo: IObject) => void;

    /**
     * 挂机事件
     * @param {Object} callInfo 通话信息
     */
    onHangup?: (callInfo: IObject) => void;

    /**
     * 重置技能组结果事件
     * @param {Object} groupInfo SDK 返回的重置技能组结果
     */
    onResetQueues?: (groupInfo: IObject) => void;

    /**
     * 技能组列表更新事件
     * @param {Object} data SDK 返回的更新后的技能组列表数据
     */
    onQueueListUpdate?: (data: IObject) => void;

    /**
     * 转接坐席列表更新事件
     * @param {Object} data SDK 返回的更新后的转接坐席列表数据。
     */
    onTransferAgentListUpdate?: (data: IObject) => void;

    /**
     * 会议信息更新事件
     * @param {Object} data SDK 返回的更新后的会议信息
     */
    onConferenceInfoUpdate?: (data: IObject) => void;

    /**
     * 坐席排队信息更新事件
     * @param {Object} queueInfo 坐席排队信息
     */
    onQueueUpdate?: (queueInfo: IObject) => void;

    /**
     * 用户输入完成事件
     * @param {Object} callInfo 通话信息
     */
    onUserInputCompleted?: (data: IObject) => void;

    /**
     * 连接被服务器断开事件
     * @param {Object} callInfo 通话信息
     */
    onLinkDisconnected?: (callInfo: IObject) => void;

    /**
     * 自定义转接按钮点击事件
     * 
     * 配置此事件后，点击转接按钮将不会展示默认UI
     * @param {Array<Object>} data 转接数据
     */
    onTransferClick?: (data: IObject[]) => void;

    /**
     * 自定义会议按钮点击事件
     * 
     * 配置此事件后，点击会议按钮将不会展示默认UI
     * @param {Array<Object>} data 会议数据
     */
    onConferenceClick?: (data: IObject[]) => void;

  }
}

export = PhoneBar;
