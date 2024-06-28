declare class AgentApi {

  /**
   * 坐席修改状态为非就绪状态
   *
   * @param reasonCode 非就绪原因码 NotReadyReason
   */
  agentNotReady(reasonCode: number): void;

  /**
   * 坐席修改状态为就绪状态
   */
  agentReady(): void;

  /**
   * 手动拨号
   * @param dest
   * @param id
   * @param type 呼叫类型，参考CALLTYPE常量
   * @param module  手动回拨
   * @param call_id  原电话 callId
   * @param queue
   * @param newTransPara
   * @param taskId
   * @param numberId
   * @returns {boolean}
   */
  makeCall(dest: string, id: string, type: string, module: number | string, call_id: string, queue: string, newTransPara: string, taskId: string, numberId: string): boolean | void;

  /**
   * 接听电话
   */
  answerCall(): void;

  /**
   * 接听排队中呼叫
   * @param callId
   * @param {String} thisQueue 所在技能组
   */
  answerCallByQueue(callId: string, thisQueue: string): void;

  /**
   * 保持呼叫
   */
  holdCall(): void;

  /**
   * 接回保持的呼叫
   * @returns {boolean}
   */
  retrieveCall(): void;

  /**
   * 挂断电话
   * @param lineId 要挂断的线路ID
   * @returns {boolean}
   */
  releaseCall(lineId: string): void;

  /**
   * 两步转接-咨询
   * @param targetDN
   */
  consult(targetDN: string): void;

  /**
   * 咨询后转出
   */
  completeTransfer(): void;

  /**
   * 呼叫转移
   * @param targetDN {String} 目标坐席工号或者外线号码
   */
  singleStepTransfer(targetDN: string): void;

  /**
   * 三方通话
   * @param phoneNumber
   * @returns {boolean}
   */
  threeWayCall(phoneNumber: string): void;

  /**
   * 结束三方通话
   * @param callId
   */
  releaseThreeWayCall(callId: string): void;

  /**
   * 发送DTMF
   *
   * @param lineId 要挂断的线路ID，当为空时取当前默认线路
   * @param digit 按键
   */
  sendDTMF(lineId: string, digit: string): void;

  /**
   * 监听
   * @param callId
   * @param targetDN
   */
  monitorCall(callId: string, targetDN: string): void;

  /**
   * 强插
   * @param callId
   * @param targetDN
   */
  doInterruptCall(callId: string, targetDN: string): void;

  /**
   * 拦截
   * @param callId
   * @param targetDN
   * @param phoneNumber
   */
  substitute(callId: string, targetDN: string, phoneNumber: string): void;

  /**
   * 挂断
   * @param callId
   * @param targetDN
   */
  releaseAgentCall(callId: string, targetDN: string): void;

  /**
  * 按键采集
  * @param ivr_id
  */
  digitCollections(ivr_id: string): void;

  /**
   * 通话中设置业务参数
   * @param attachDatas {"call_data":"1","trans_para":"2"}
   */
  setAttachDatas(attachDatas: string): void;

  /**
   * 通话中设置随路数据(业务参数)(推荐)
   * @param callData String类型
   */
  setCallData(callData: string): void;

  /**
   * 获取队列监控技能组
   */
  requestCrmQueueMonitorInfo(): void;

  

  /**
   * 开始队列监控
   * @param queueCodes 示例：["100108000","100108001"]
   */
  requestStartQueueMonitoring(queueCodes: string[]): void;

  /**
   * 停止队列监控
   */
  requestStopQueueMonitoring(): void;

  /**
   * 插队
   * @param queue 技能组
   * @param callId 通话callId
   * @param score 越小越靠前
   */
  jumpTheQueue(queue: string, callId: string, score: number): void;

  /**
   * 语音助手-播放录音
   * @param path
   */
  playVoice(path: string): void;

  /**
   * 语音助手-播放文本
   * @param text
   */
  playText(text: string): void;

  /**
   * 语音助手-停止放音
   */
  stopPlay(): void;

  /**
   * 语音助手-暂停/继续放音
   * （不支持TTS的继续放音）
   */
  pausePlay(): void;

  /**
   * 获取可监控的坐席信息
   */
  requestMonitorMembers(): void;

  /**
   * 获取可监控的坐席信息
   */
  setAutoReady(): void;

  /**
   * 发送最新排队信息请求
   */
  sendQueueInfoRequest(): void;

}

export default AgentApi