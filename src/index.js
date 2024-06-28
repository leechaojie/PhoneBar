import './css/common.css';

import './assets/js/ie9';
import EventEmitter from 'eventemitter3';
import Agent from "./model/Agent";
import CTIConnection from "./CTIConnection";
import PhoneBarComponent from "./view/PhoneBarComponent";
import utils from "./utils/utils";
import DialPad from "./view/DialPad";
import LinePool from "./model/LinePool";
import {CallType, MessageID, LineState, PartyState, DeviceState} from "./constants";
import ThreewayCallBox from "./view/ThreewayCallBox";
import AgentConfig from "./model/AgentConfig";
import Log from "./utils/Log";
import SoftPhoneConnection from "./SoftPhoneConnection";

class PhoneBar extends EventEmitter {

    /**
     * 构建电话条及核心业务
     * @param renderTo  页面元素id，渲染到指定元素内，默认追加到body内
     * @param proxyUrl  坐席代理服务地址
     * @param startupSoftPhone 是否自动启动软电话，如果自动启动必须配置SIP服务地址
     * @param sipServerUrl SIP服务地址
     * @param username 账号
     * @param token 页面登录的token
     * @param tid  租户ID
     * @param thisDN  分机号
     * @param pstnDN  PSTN号码，可以为null
     * @param agentID  坐席的工号，与分机号一致
     * @param password 密码
     * @param loginType 密码类型 0 不加密; 1 普通加密; 2 （32位随机数+密码)加密;
     * @param thisQueues  所在坐席组,类型Array数组(格式如：[100018000,100018001])
     * @param defaultQueue  默认/签入坐席组,所在技能组中的其中一个
     * @param tipTime  设置后每隔*分钟会自动提醒某一状态是否超时;默认0不提醒
     * @param autoIdleWhenAfterWork  话后自动进入就绪状态;默认null未配置，false不启用
     * @param maxAfterWorkTime  话后持续设置时间后会自动进入就绪状态;默认0不启用
     * @param autoIdleWhenLogin  登录后自动置闲
     * @param isPhoneTakeAlong  是否手机随行，即手机在线，默认为false
     * @param workPhone  随行手机号
     * @param autoAnswer  自动应答     
     * @param customNotReadyReason  自定义坐席状态
     * @param onScreenPopup 弹屏事件
     * @param onRinging  呼入振铃事件
     * @param onTalking  接通事件
     * @param onHangup  挂机事件
     * @param onAgentStatusChange 坐席状态变更事件
     * @param onQueueUpdate 坐席队列更新事件
     * @param onResetQueues 重置技能组结果事件
     * @param onQueueListUpdate 技能组列表更新事件
     * @param onTransferAgentListUpdate  转接坐席列表更新事件
     * @param onConferenceInfoUpdate  会议列表更新事件
     * @param onTransferClick 转接按钮点击时间
     * @param onConferenceClick 会议按钮点击时间
     * @param onLinkDisconnected 连接被服务器断开事件
     */
    constructor({
                    renderTo = '',
                    proxyUrl = 'ws://127.0.0.1:8787/websocket',
                    startupSoftPhone = false,
                    sipServerUrl = '127.0.0.1:5188',

                    debug = false,
                    log = true,
                    username = '',
                    token = '',
                    tid = '',
                    thisDN = '',
                    pstnDN = '',
                    agentID = '',
                    password = '',
                    loginType = 0,
                    thisQueues = [],
                    defaultQueue = '',

                    tipTime = 0,
                    autoIdleWhenAfterWork = null,
                    maxAfterWorkTime = 0,
                    autoIdleWhenLogin = true,
                    isPhoneTakeAlong = false,
                    workPhone = '',
                    autoAnswer = false,

                    customNotReadyReason = [],

                    onScreenPopup,
                    onRinging,
                    onTalking,
                    onHangup,
                    onAgentStatusChange,
                    onLinkDisconnected,
                    onUserInputCompleted,
                    onResetQueues,
                    onQueueListUpdate,
                    onTransferAgentListUpdate,
                    onConferenceInfoUpdate,
                    onTransferClick,
                    onConferenceClick,
                    onQueueUpdate,
                }) {
        super();
        const options = this.options = arguments[0];
        options.customNotReadyReason = customNotReadyReason;

        // 初始化线路信息
        this.linePool = new LinePool();
        // 初始化坐席配置
        this.agentConfig = new AgentConfig(options);
        // 初始化坐席数据
        this.agent = new Agent(options);
        // 初始化坐席自定义状态
        Agent.setCustomNotReadyReason(options.customNotReadyReason);

        // 初始化CTI服务websocket
        this.connection = new CTIConnection({
            wsUrl: options.proxyUrl,
            debug: options.debug,
            username: options.username,
            token: options.token,
            agent: this.agent,
            agentConfig: this.agentConfig,
            linePool: this.linePool,
        });

        // 初始化创建API
        this.agentApi = this.connection.agentApi;

        // 与软电话websocket
        this.softPhoneConnection = new SoftPhoneConnection({
            'serverUrl':sipServerUrl,
            'username': agentID, password, loginType
        });

        // 初始化ui
        this.phoneBarComponent = new PhoneBarComponent({
            onTransferClick: onTransferClick,
            onConferenceClick: onConferenceClick
        });

        this.getComponent('agentState').on('agentStateSelected', this._onAgentStateSelected.bind(this));
        this.getComponent('openDialPad').on('click', () => {
            this._showDialPad({btnName: '呼叫', onDynamicButtonClick: this.makeCall.bind(this, null)});
        });
        this.getComponent('answer').on('click', () => {
            this.agentApi.answerCall();
        });
        this.getComponent('hangup').on('click', () => {
            this.agentApi.releaseCall();
        });
        this.getComponent('hold').on('click', () => {
            this.agentApi.holdCall();
        });
        this.getComponent('retrieve').on('click', () => {
            this.agentApi.retrieveCall();
        });
        this.getComponent('transfer').on('click', () => {
            this.emit('transferClick', this.transferData);
            this.requestQueueList()
            this.requestTransferAgentData()
        });
        this.getComponent('transfer').on('itemClick', this.onTransferItemClick.bind(this));
        this.getComponent('rollout').on('click', () => {
            this.agentApi.completeTransfer();
        });
        this.getComponent('conference').on('click', () => {
            this.emit('conferenceClick', this.conferenceData);
        });
        this.getComponent('conference').on('itemClick', this.onConferenceItemClick.bind(this));

        // 三方通话缓存数据
        this.threewayCallData = [];

        // 转接缓存数据
        this.transferData = null;

        // 会议缓存数据
        this.conferenceData = null;

        // 添加监听-------------------
        utils.isFunction(onScreenPopup) && this.on('screenPopup', onScreenPopup);
        utils.isFunction(onRinging) && this.on('ringing', onRinging);
        utils.isFunction(onTalking) && this.on('talking', onTalking);
        utils.isFunction(onHangup) && this.on('hangup', onHangup);
        utils.isFunction(onAgentStatusChange) && this.agent.on('agentStateChange', onAgentStatusChange);
        utils.isFunction(onLinkDisconnected) && this.connection.on('linkDisconnected', onLinkDisconnected);
        utils.isFunction(onUserInputCompleted) && this.connection.on('userInputCompleted', onUserInputCompleted);
        utils.isFunction(onQueueUpdate) && this.connection.on('eventQueued', onQueueUpdate);
        utils.isFunction(onResetQueues) && this.connection.on('resetQueues', onResetQueues);
        utils.isFunction(onQueueListUpdate) && this.connection.on('queueListUpdate', onQueueListUpdate);
        utils.isFunction(onTransferAgentListUpdate) && this.connection.on("transferAgentListUpdate", onTransferAgentListUpdate);
        utils.isFunction(onConferenceInfoUpdate) && this.on('conferenceInfo', onConferenceInfoUpdate);
        utils.isFunction(onTransferClick) && this.on('transferClick', onTransferClick);
        utils.isFunction(onConferenceClick) && this.on('conferenceClick', onConferenceClick);
        this.eventHandler();
        this.initial();
    }

    /**
     * 事件处理
     */
    eventHandler() {
        // 三方通话接通
        this.connection.on(MessageID.EventThreeWayEstablished.toString(), (data) => {
            this.threewayCallData.push({'phoneNumber': data.otherDN, 'callID': data.callID});
            !this.threewayCallBox || this.threewayCallBox.join(data.otherDN, data.callID);
        });
        // 三方通话挂单
        this.connection.on(MessageID.EventThreeWayReleased.toString(), (data) => {
            this.threewayCallData = this.threewayCallData.filter((v) => v.phoneNumber !== data.otherDN);
            !this.threewayCallBox || this.threewayCallBox.remove(data.otherDN);
            utils.showMessage(`${data.otherDN} 已退出会议`);
        });
        // 转接菜单列表事件
        this.connection.on(MessageID.EventTransferMenuList.toString(), (data) => {
            this.updateTransferMenu(data.menuList);
            this.transferData = data.menuList
        });
        // 会议菜单列表事件
        this.connection.on(MessageID.EventConferenceMenuList.toString(), (data) => {
            this.updateConferenceMenu(data.menuList);
            this.conferenceData = data.menuList
        });
        // 自动就绪配置
        this.connection.on(MessageID.EventAutoReadyConfig.toString(), (data) => {
            // 本地未配置时使用服务端配置
            if (this.agentConfig.autoIdleWhenAfterWork == null) {
                this.agentConfig.autoIdleWhenAfterWork = data.autoSavePopup;
            }
            // 如果服务端与本地不同，更新服务端配置
            else if (this.agentConfig.autoIdleWhenAfterWork !== data.autoSavePopup && data.maxAfterworkTime !== 0) {
                this.agentApi.setAutoReady(this.agentConfig.autoIdleWhenAfterWork);
            }
            if (this.agentConfig.autoIdleWhenAfterWork) {
                if (data.maxAfterworkTime === 0) {
                    utils.showMessage('企业未启用自动就绪，如需开启请联系管理员！');
                } else {
                    this.agentConfig.maxAfterWorkTime = data.maxAfterworkTime;
                }
            } else {
                this.agentConfig.maxAfterWorkTime = 0;
            }

            // 合并后端配置的自定义状态
            const agentStateExtList = data.agentStateExtList
            if (agentStateExtList && agentStateExtList.length > 0) {
                this.phoneBarComponent.mergeRemoteActionList(agentStateExtList);
            }
        });

        // 需要转接的座席信息
        this.connection.on(MessageID.CrmTransferAgentInfo.toString(), (data) => {
            this.connection.emit('transferAgentListUpdate', data);
            // utils.isFunction(onTransferClick) && this.on('transferClick', onTransferClick);
        });

        // 班组列表
        // this.connection.on(MessageID.CrmGroupList.toString(), (data) => {
        //     console.log('CrmGroupList-3506', data);
        // });

        // 技能组列表
        this.connection.on(MessageID.CrmQueueList.toString(), (data) => {
            this.connection.emit('queueListUpdate', data);
        });

        // 会议信息
        this.connection.on(MessageID.CrmConferenceAgentInfo.toString(), (data) => {
            this.connection.emit('conferenceInfo', data);
        });


        // 监听座席状态定时器
        this.agent.stateTimer.on('change', (seconds, timerValue) => {
            // 更新状态持续时长
            this.getComponent('agentState').setAgentStateTimer(timerValue);

            let _tipTime = this.agentConfig.tipTime;
            if (_tipTime > 0 && seconds > 0 && seconds % (_tipTime * 60) === 0 && this.agent.state !== Agent.BUSY) {
                let timeTips = `您已保持"${this.agent.getCurrentStateName()}"状态${this.agent.stateTimer.format(['小时','分钟','秒'])}`;
                utils.showMessage(timeTips);
            }

            let _maxAfterWorkTime = this.agentConfig.maxAfterWorkTime;
            if (_maxAfterWorkTime > 0 && seconds >= _maxAfterWorkTime && (seconds - _maxAfterWorkTime) % 3 === 0) {
                //当坐席处于整理状态，当坐席再次呼出的时候，state依然为notready，reason依然是0，此时，如果到了最大整理时长，坐席将会就绪，也就是会二次进线
                if (this.agent.state === Agent.NEATENING) {
                    if (this.linePool.getWorkingLineCount() === 0) {
                        this.agentApi.agentReady();
                    }
                }
            }
        });

        // 坐席状态变更事件处理函数
        this.agent.on('agentStateChange', (state) => {
            if (this.log) console.log("------坐席状态变更事件处理函数--------------");
            this.getComponent('agentState').changeAgentState(state);
            this.handlerOnMediaNotification('agentStateChange', state);       

            if(this.agent.deviceState === DeviceState.REGISTERED) {
                if (state === Agent.READY) {
                    this.phoneBarComponent.changeButtonWhenReady();
                } else if (state === Agent.BUSY || state === Agent.REST || state === Agent.NEATENING) {
                    this.phoneBarComponent.changeButtonWhenNotReady();
                } else if (state === Agent.OFFLINE) {
                    this.phoneBarComponent.changeButtonWhenLogout();
                }
            }
        });

        // 设备状态变更事件处理函数
        this.agent.on('deviceStateChange', (deviceState) => {
            if (deviceState === DeviceState.UNREGISTERED) {
                this.phoneBarComponent.changeButtonSipNG();
            } else {
                this.phoneBarComponent.changeButtonSipOK();
            }
        });

        // 线路状态变更事件处理
        this.linePool.on('lineDataChange', (line, callInfo, data) => {
            if (this.log) console.log("====线路状态变更事件处理========");
            if (this.linePool.getCurrentLineId() === line.id) {
                if (line.lineState === LineState.IDLE) {
                    this.agentApi.agentNotReady(0);
                    this.phoneBarComponent.changeButtonWhenIdle();
                    this.emit('hangup', callInfo, data);
                    if (this.log) console.log(JSON.stringify(data)+"--hangup事件-----"+JSON.stringify(callInfo));
                    this.handlerOnMediaNotification('hangup', callInfo);
                } else if (line.lineState === LineState.DIALING) {
                    this.agent.setAgentState(Agent.RINGING);
                    //if (this.log) console.log("--设置坐席状态-----"+line.lineState);
                    //this.handlerOnMediaNotification('agentStateChange', line.lineState);        
                    this.phoneBarComponent.changeButtonWhenDialing(callInfo.callType);
                    this.emit('ringing', callInfo, data);
                    if (this.log) console.log(JSON.stringify(data)+"--设置振铃事件-----"+JSON.stringify(callInfo));
                    this.handlerOnMediaNotification('ringing', callInfo);    
                } else if (line.lineState === LineState.RINGING) {
                    this.agent.setAgentState(Agent.RINGING);
                    //if (this.log) console.log("--设置坐席状态-----"+line.lineState);
                    //this.handlerOnMediaNotification('agentStateChange', line.lineState); 
                    this.phoneBarComponent.changeButtonWhenRinging();
                    this.emit('ringing', callInfo, data);
                    if (this.log) console.log(JSON.stringify(data)+"--设置振铃事件-----"+JSON.stringify(callInfo));
                    this.handlerOnMediaNotification('ringing', callInfo);
                } else if (line.lineState === LineState.HELD) {
                    this.phoneBarComponent.changeButtonWhenHold();
                } else if (line.lineState === LineState.TALKING) {
                    this.agent.setAgentState(Agent.TALKING);
                    //if (this.log) console.log("--设置坐席状态-----"+line.lineState);
                    //this.handlerOnMediaNotification('agentStateChange', line.lineState); 
                    this.phoneBarComponent.changeButtonWhenTalking(callInfo.callType);
                    this.emit('talking', callInfo, data);
                    if (this.log) console.log(JSON.stringify(data)+"--talking事件-----"+JSON.stringify(callInfo));
                    this.handlerOnMediaNotification('talking', callInfo);
                }
            }

            // 两步转接
            if (callInfo.callType === CallType.CONSULT) {
                // 两步转接第一步主叫方按钮状态：被叫方(被咨询方)坐席应答时按钮状态
                if (data.partyState === PartyState.TALK && data.thisRole === 1 && data.otherRole === 2 &&
                    (this.linePool.isExistLineByCallType(CallType.INBOUND) || this.linePool.isExistLineByCallType(CallType.OUTBOUND))
                ) {
                    this.phoneBarComponent.changeButtonWhenDouble();
                }
                // 两步转接第一步被叫方(被咨询方)按钮状态：坐席应答时的按钮状态
                if (data.partyState === PartyState.TALK && data.thisRole === 2 && data.otherRole === 1) {
                    this.phoneBarComponent.changeButtonWhenDoubleCalled();
                }
                // 两步转被叫方挂断
                if (line.lineState === LineState.IDLE && callInfo.otherDN === data.sendBy && data.thirdDN === data.sendBy) {
                    this.phoneBarComponent.changeButtonWhenDoubleDiscon(); // 转出按钮置灰
                    if (data.sendBy.length === 9) {
                        utils.showMessage('坐席 ' + data.sendBy + ' 已挂断！');
                    } else {
                        utils.showMessage('外线 ' + data.sendBy + ' 已挂断！');
                    }
                }
            }

            // 两步转接-客户挂断的按钮(需要先判断咨询线路是否还存在)
            if (line.lineState === LineState.IDLE && this.linePool.isExistLineByCallType(CallType.CONSULT) &&
                (callInfo.callType === CallType.INBOUND || callInfo.callType === CallType.OUTBOUND) &&
                callInfo.otherDN === data.sendBy && data.thirdDN !== '') {
                this.phoneBarComponent.changeButtonWhenCustomerDiscon();
                // 转接用的线路提升为默认线路
                this.linePool.setCurrentLineId(this.linePool.getConsultLine().id);
            }

            if (data.thisRole !== 5 && callInfo.callType !== CallType.INTERNAL && data.attachDatas['variable_thirdPartyRole'] == null) {
                this.emit('screenPopup', line.lineState, callInfo);
                if (this.log) console.log("--screenPopup事件-----"+JSON.stringify(callInfo));
                this.handlerOnMediaNotification('screenPopup', callInfo);
            }
        });
    }

    initial() {
        // 是否自动拉起软电话
        if (this.options.startupSoftPhone === true && !this.options.isPhoneTakeAlong) {
            // 与软电话建立连接
            this.softPhoneConnection.open();
            // 软电话登录成功后登录电话条
            this.softPhoneConnection.on('loginSuccess', () => this.connection.open());
        } else {
            this.connection.open();
        }

        // 创建Element
        this._rootNode = this.phoneBarComponent.rootNode;
        if (!this.options.renderTo) {
            document.body.appendChild(this._rootNode);
        } else {
            document.getElementById(this.options.renderTo).appendChild(this._rootNode);
        }
        this.phoneBarComponent.show();
    }

    /**
     * 根据名称获取组件
     * @param {String} componentName
     */
    getComponent(componentName) {
        if (componentName) {
            return this.phoneBarComponent.getButtonComponent(componentName);
        }
        return null;
    }

    /**
     * 获取转接数据
     */
    get getTransferData() {
        return this.transferData;
    }

    /**
     * 获取会议数据
     */
    get getConferenceData() {
        return this.conferenceData;
    }

    /**
     * 当坐席状态被选择时的事件处理方法
     * @param action
     * @returns {boolean}
     * @private
     */
    _onAgentStateSelected(action) {
        if (action !== 'logout' && action !== 'login' && this.agent.state === Agent.OFFLINE) {
            utils.showMessage('未登入，不能切换状态');
            return false;
        }
        if (this.linePool.getWorkingLineCount() > 0) {
            utils.showMessage('正在通话，禁止切换状态');
            return false;
        }
        switch (action) {
            case 'ready':
                this.agentApi.agentReady(true);
                break;

            case 'login':
                this.agentApi.agentLogin();
                break;

            case 'logout':
                this.agentApi.agentLogout();
                break;

            case 'busy':
                this.agentApi.agentNotReady(3);
                break;

            case 'rest':
                this.agentApi.agentNotReady(5);
                break;

            case 'reason1':
                this.agentApi.agentNotReady(11);
                break;

            case 'reason2':
                this.agentApi.agentNotReady(12);
                break;

            case 'reason3':
                this.agentApi.agentNotReady(13);
                break;

            case 'reason4':
                this.agentApi.agentNotReady(14);
                break;

            case 'reason5':
                this.agentApi.agentNotReady(15);
                break;

            case 'reason7':
                this.agentApi.agentNotReady(17);
                break;

        }

    }

    /**
     * 主动拨打呼叫
     */
    makeCall(phoneNumber) {
        phoneNumber = phoneNumber || this.dialPad.getPhoneNumber();
        if (phoneNumber.length == 4 && this.agent.tid !== '0') {
            if(this.agent.tid.length==5){
                phoneNumber=this.agent.tid+phoneNumber;
            } else {
                phoneNumber = "000002" + this.agent.tid + "08" + phoneNumber;
            }
        }
        let type = /(^000002[0-9]{6}08[0-9]{4}$)|(^[0-9]{5}[1-79][0-9]{3}$)/.test(phoneNumber) ? 1 : 3;
        this.agentApi.makeCall(phoneNumber, -1, type, null, null, this.agent.defaultQueue);
    }

    /**
     * 接听呼叫
     */
    answerCall() {
        this.agentApi.answerCall();
    }

    /**
     * 接听排队中呼叫
     * @param {String} callId 主叫id
     * @param {String} thisQueue 所在技能组
     */
    answerCallByQueue(callId, thisQueue) {
        this.agentApi.answerCallByQueue(callId, thisQueue);
    }

    /**
     * 更新转移下拉菜单选项
     */
    updateTransferMenu(data) {
        let transferComponent = this.getComponent('transfer');
        // 如果转外线号码清空子选项
        data && data.forEach(val => {
            if (val.type === 'transferOutLine') {
                val['contacts'] = val.menu;
                val.menu = [];
            }
        });
        transferComponent.updateMenuData(data);
    }

    /**
     * 当转移菜单的选项被选中时的事件处理函数
     * @param val
     */
    onTransferItemClick(val) {
        if (val.type === 'transferOutLine') {
            // 转外线号码
            this._showDialPad({
                'title': '转外线号码',
                'contacts': val.contacts,
                'btnName': '咨询',
                onDynamicButtonClick: this._transferThis.bind(this)
            });
        } else if (val.type === "doublestep") {
            // 两步转接
            this.agentApi.consult(val.agentId);
        } else if (val.type === "btnCollect") {
            // 按键采集
            this.agentApi.digitCollections(val.ivrId);
        } else if (val.type === "btnSatisfaction") {
            // 转满意度
            this.agentApi.singleStepTransfer(`icp_${val.ivrId}`);
        } else if (val.ivrId) {
            // 转IVR
            this.agentApi.singleStepTransfer(`ivr_${val.ivrId}`);
        } else if (val.type === "singlestep") {
            // 单步转接
            this.agentApi.singleStepTransfer(val.agentId);
        }
    }

    /**
     * 转接事件处理
     * @param type 转接类型
     * @param id 转接id或号码
     */
    transferHandler(type, id) {
        switch (type) {
            case "outside": // 转外线号码
                this._transferThis(id);
                break;

            case "group": // 转技能组
                this.agentApi.singleStepTransfer(id);
                break;

            case "ivr": // 转IVR
                this.agentApi.singleStepTransfer(`ivr_${id}`);
                break;

            case "key": // 转按键采集
                this.agentApi.digitCollections(id);
                break;

            case "satisfaction": // 转满意度
                this.agentApi.singleStepTransfer(`icp_${id}`);
                break;
        }
    }

    /**
     * 更新会议下拉菜单选项
     */
    updateConferenceMenu(data) {
        let conferenceComponent = this.getComponent('conference');
        // 会议
        data && data.forEach(val => {
            if (val.type === 'only') {
                val['contacts'] = val.menu;
                val.menu = [];
            }
        });
        conferenceComponent.updateMenuData(data);
    }

    /**
     * 当会议菜单选项被点击时的事件处理函数
     * @param val 选中菜单的数据
     */
    onConferenceItemClick(val) {
        // 加入自定义电话/多方通话管理
        if (val.type === 'only') {
            if (val.id === 'user_defined') {
                // 加入自定义电话
                this._showDialPad({
                    'title': '加入自定义电话', 'contacts': val.contacts, 'btnName': '会议',
                    onDynamicButtonClick: () => {
                        this.agentApi.threeWayCall(this.dialPad.getPhoneNumber());
                    }
                });
            } else if (val.id === 'conversation') {
                //多方通话管理
                this._showThreewayCallBox();
            }
        } else {
            this.agentApi.threeWayCall(val.agentId);
        }
    }
    
    /**
     * 更新坐席排队信息
     * @public
     * 可以在点击排队列表时更新
     */
    updateQueueInfo() {
        const {thisQueues, defaultQueue, queueInfo} = this.connection.resetQueues
        this.agentApi.sendQueueInfoRequest(thisQueues);
    }

    /**
     * 转接时弹出拨号盘的拨号按钮控制
     * @private
     * @param phoneNumber
     */
    _transferThis(num) {
        const phoneNumber = num || this.dialPad.getPhoneNumber();
        const line = this.linePool.getCurrentLine();
        if (line.lineState === LineState.HELD) {
            this.agentApi.completeTransfer();
            this.dynamicButton.title = '咨询';
        } else {
            let thisExten = this.agent.thisDN;
            if (line.phoneNumber === phoneNumber) {
                utils.showMessage('不能转接当前正在接通的号码');
            } else if (phoneNumber === thisExten) {
                utils.showMessage('不能转接自己');
            } else {
                if (line.lineState === LineState.TALKING) {
                    this.agentApi.consult(phoneNumber);
                    // 延迟加载
                    this.dialPad.setPhoneNumber(phoneNumber);
                    this.dynamicButton.title = '转出';
                } else {
                    utils.showMessage("当前线路未在通话中，不能转接");
                }
            }
        }
    }

    /**
     * 显示多方通话弹出框
     * @private
     */
    _showThreewayCallBox() {
        // 当存在则先显示此对话框
        if (this.threewayCallBox) {
            this.threewayCallBox.show();
        } else {
            this.threewayCallBox = new ThreewayCallBox({
                title: '多方通话管理',
                onJoinButtonClick: (phoneNumber) => {
                    this.agentApi.threeWayCall(phoneNumber);
                },
                onRemoveCallButtonClick: (callId) => {
                    this.agentApi.releaseThreeWayCall(callId);
                },
                onRemoveAllCallButtonClick: () => {
                    this.agentApi.releaseThreeWayCall('non_moderator');
                }
            });
            // 初始化列表数据
            this.threewayCallData.forEach((callData) => {
                this.threewayCallBox.join(callData.phoneNumber, callData.callID);
            });
            this.threewayCallBox.show();
        }
    }

    /**
     * 显示拨号盘
     * @private
     */
    _showDialPad({
        title = '拨号',
        contacts = [],
        btnName,
        onDynamicButtonClick = function () { }
    }) {
        // 当存在则先关闭此对话框
        if (this.dialPad) {
            this.dialPad.destroy();
        }

        this.dynamicButton = DialPad.createButton({
            btnName: btnName,
            className: 'answer',
            onClick: onDynamicButtonClick
        });

        this.dialPad = new DialPad({
            'title': title,
            'contacts': contacts,
            'dynamicButton': this.dynamicButton,
            'onHangupButtonClick': () => {
                this.agentApi.releaseCall();
            }
        });
        this.dialPad.show();
    }

    /**
     * 请求转接坐席数据
     * @param limitAgent 查询座席名字或账号
     * @param state 查询状态
     * @param queueCode 查询技能组
     * @param grpStreamNumber 查询班组
     */
    requestTransferAgentData(limitAgent = '', state = '', queueCode = '', grpStreamNumber = '') {
        // 请求转接坐席数据
        const data = {
            "messageId": 3501,
            "thisDN": this.agent.thisDN,
            "agentID": this.agent.agentID,
            limitAgent,
            state,
            queueCode,
            grpStreamNumber
        };
        this.connection.send(data);
    }

    /**
     * 请求班组列表
     */
    // requestTeamList() {
    //     const data = {
    //         "messageId": 3505,
    //         "thisDN": this.agent.thisDN,
    //         "agentID": this.agent.agentID,
    //         "thisQueues": this.agent.thisQueues
    //     };
    //     this.connection.send(data);
    // }

    /**
     * 请求技能组列表
     */
    requestQueueList() {
        // 请求班组列表
        const data = {
            "messageId": 3507,
            "thisDN": this.agent.thisDN,
            "agentID": this.agent.agentID,
            "thisQueues": this.agent.thisQueues
        };
        this.connection.send(data);
    }

    /**
     * 请求会议数据
     * @param limitAgent 查询座席名字或账号
     * @param state 查询状态
     * @param queueCode 查询技能组
     * @param grpStreamNumber 查询班组
     */
    requestConferenceData(limitAgent = '', state = '', queueCode = '', grpStreamNumber = '') {
        const data = {
            "messageId": 3509,
            "thisDN": this.agent.thisDN,
            "agentID": this.agent.agentID,
            limitAgent,
            state,
            queueCode,
            grpStreamNumber
        };
        this.connection.send(data);
    }

    /**
     * 该方法会删除页面上显示的电话条元素、绑定的事件和断开与CTI服务器的连接
     */
    destroy() {
        if (this._rootNode && this._rootNode.parentNode) {
            this._rootNode.parentNode.removeChild(this._rootNode);
        }
        if (this.dialPad) {
            this.dialPad.destroy();
        }
        if (this.threewayCallBox) {
            this.threewayCallBox.destroy();
        }

        this.agentApi.agentLogout();
        this.connection.doClose();
        !this.softPhoneConnection || this.softPhoneConnection.doClose();
    }

    handlerOnMediaNotification(type, data) {
        if (typeof onMediaNotification === 'function') {
            onMediaNotification('phone', type, data);
        }
    }


}


PhoneBar.utils = utils;
PhoneBar.Log = Log;


export default PhoneBar;
