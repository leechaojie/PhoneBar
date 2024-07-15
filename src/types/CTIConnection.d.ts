declare class CTIConnection {
  /**
   * 是否与CTI服务器建立连接
   * @returns {null | boolean}
   */
  isOpened(): null | boolean;

  /**
   * 发送消息
   * @param data
   * @returns {boolean}
   */
  send(data: object): boolean;

  /**
   * 关闭连接
   */
  doClose(): void;

}

export default CTIConnection