import EventEmitter from 'eventemitter3';
import Log from "./utils/Log";
import { Client } from '@stomp/stompjs';
import * as SockJS from 'sockjs-client';

/**
 * websocket客户端基础类，用于子类继承
 */
class WebSocketBaseClient extends EventEmitter {

    constructor({
        url = 'ws://127.0.0.1:57712', protocols = [],
        username = '',
        token = '',

        automaticOpen = true,
        keepAliveInterval = 20000,

        debug = false
    } = {}) {
        super();
        this.url = url;
        this.username = username;
        this.token = token;
        this.protocols = protocols;

        /** 实例化后是否自动打开 */
        this.automaticOpen = automaticOpen;
        /** 心跳包时间间隔 */
        this.keepAliveInterval = keepAliveInterval;

        this.client = null;
        this.status = ''

        this.debug = debug;

        if (this.automaticOpen) {
            this.open();
        }

    }

    /**
     * 初始化
     */
    open() {
        if (this.token.length <= 0) {
            Log.log("token不存在") 
            return;
        }

        if (!this.client) {
            this.client = new Client({
                debug: (str) => {
                    console.log(str);
                },
                reconnectDelay: 4000,
                heartbeatIncoming: 61000,
                heartbeatOutgoing: 61000,
            });

            this.client.webSocketFactory =  () => {
                const _options = { transports: ["websocket", "xhr-polling"] };
                // IOS系统兼容
                if (/AppleWebKit/.test(navigator.userAgent) && /Mobile\/\w+/.test(navigator.userAgent)) {
                    _options.transports = ["xhr-polling"];
                }
                return new SockJS(this.url + '/stomp?access_token=' + this.token, null, _options);
            };

            this.client.onConnect = (frame) => {
                Log.log('连接成功');
                this.onOpen(frame);
                // 客户端订阅消息的目的地址
                this.client.subscribe('/topic/user.100003test5', (response) => {
                    Log.log(response.body, 'output');
                    this.onMessage(response.body);
                });
                
            };

            this.client.onWebSocketClose = (frame) => {
                console.log("连接断开", frame);
                switch (frame.code) {
                    case 1002:
                        Log.log("无法链接到服务器");
                        break;

                    case 2000:
                        Log.log("token异常或其他原因服务器拒绝了访问");
                        break;
                
                    default:
                        Log.log("连接断开")
                        break;
                }
            }

            this.client.onStompError = (frame) => {
                console.log("onStompError", frame);
                Log.log("StompError-连接失败");
                this.onError(aEvent)
            };

            this.client.onWebSocketError = (frame) => {
                console.log("onWebSocketError", frame);
                Log.log("WebSocketError-连接失败");
            };

            this.client.activate();
        }
    }

    /**
     * 浏览器是否支持WebSocket
     * @returns {boolean} 是否支持
     */
    static browserSupportsWebSockets() {
        return (window.WebSocket !== null && window.WebSocket !== undefined);
    }

    onOpen(aEvent) {}

    onClose(aEvent) {}

    onMessage(message) {}

    onError(aEvent) {}

    isOpened() {
        return this.client && this.client.connected
    }

    close() {
        if (this.client) {
            this.client.deactivate();
            this.client = null;
        }
    }

    sendMessage(aToken) {
        if (this.client) {
            return this.client.publish({
                "destination": "/cti/call",
                body: JSON.stringify(aToken)
            });
        } else {
            throw 'INVALID_STATE_ERR : Pausing to reconnect websocket';
        }

    }

    /**
     * 发送ping消息
     */
    ping() {}

    /**
     * 开始一个连接保持定时器
     */
    startKeepAlive(immediate = true) {
        // 如果有一个正在运行的定时器
        if (this.keepAliveTimeout) {
            this.stopKeepAlive();
        }
        // 如果没有open
        if (!this.isOpened()) {
            // TODO: 这里添加合理的返回结果
            return;
        }
        if (immediate) {
            // 如果立即执行，直接发送一次ping指令
            this.ping();
        }
        // 初始化一个定时器
        this.keepAliveTimeout = setInterval(() => {
            if (this.isOpened()) {
                this.ping();
            } else {
                this.stopKeepAlive();
            }
        },
            this.keepAliveInterval
        );
    }

    /**
     * 结束一个连接保持定时器
     */
    stopKeepAlive() {
        // TODO: 这里添加合理的返回结果
        if (this.keepAliveTimeout) {
            clearInterval(this.keepAliveTimeout);
            this.keepAliveTimeout = null;
        }
    }
}

export default WebSocketBaseClient;
