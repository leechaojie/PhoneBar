import EventEmitter from 'eventemitter3';
import Timer from "./Timer";
import utils from "../utils/utils";
import {AgentState, NotReadyReason, DeviceState} from "../constants";

/**
 * 坐席对象
 * 更新坐席状态时会触发坐席状态变更事件 'agentStateChange'，可以通过on或addListener监听事件变化
 * 'agentStateChange'事件默认抛出2个参数，第一个state当前状态，第二个state修改之前的值
 */
class Agent extends EventEmitter {

    /**
     * @param tid  租户ID
     * @param thisDN  分机号
     * @param pstnDN  PSTN号码，可以为null
     * @param agentID  坐席的工号，与分机号一致
     * @param thisQueues  所在坐席组,类型Array数组(格式如：[100018000,100018001])
     * @param defaultQueue  默认/签入坐席组,所在技能组中的其中一个
     * @param state  坐席当前状态
     */
    constructor({
                    tid = '',
                    thisDN = '',
                    pstnDN = null,
                    agentID = '',
                    thisQueues = [],
                    defaultQueue = '',
                }) {
        super();
        this._tid = tid;
        this._thisDN = thisDN;
        this._pstnDN = pstnDN;
        this._agentID = agentID;
        this._thisQueues = thisQueues;
        this._defaultQueue = defaultQueue;

        this._state = Agent.OFFLINE;
        this._deviceState = DeviceState.REGISTERED;

        this.stateTimer = new Timer().start();
    }


    get tid() {
        return this._tid;
    }

    get thisDN() {
        return this._thisDN;
    }

    get pstnDN() {
        return this._pstnDN;
    }

    get agentID() {
        return this._agentID;
    }

    get thisQueues() {
        return this._thisQueues;
    }

    get defaultQueue() {
        return this._defaultQueue;
    }

    get state() {
        return this._state;
    }

    get deviceState() {
        return this._deviceState;
    }

    /**
     * 设置坐席状态
     * @param state
     */
    setAgentState(state) {
        if (this._state !== state) {
            let beforeValue = this._state;
            this._state = state;
            this.stateTimer.restart();
            this.emit('agentStateChange', state, beforeValue);
        }
    }

    /**
     * 设置话机状态
     * @param deviceState
     */
    setDeviceState(deviceState) {
        if (deviceState === DeviceState.UNREGISTERED) {
            utils.showMessage("请登陆SIP话机，并刷新坐席状态");
        } else if (this._deviceState !== deviceState && deviceState === DeviceState.REGISTERED) {
            utils.showMessage("SIP话机注册成功");
        }
        if (this._deviceState !== deviceState) {
            this._deviceState = deviceState;
            this.emit('deviceStateChange', deviceState);
        }
    }

    /**
     * 获得当前状态名称
     * @returns {*}
     */
    getCurrentStateName() {
        return Agent.getStateName(this._state);
    }

    static getStateName(state) {
        return (Agent.stateDict[state] ?  Agent.stateDict[state].name : '');
    }

    /**
     * 设置自定义未就绪状态
     * @param notReadyReason
     */
    static setCustomNotReadyReason(notReadyReason) {
        for (const reason of notReadyReason) {
            const _notReadyStateKey = Agent.reasonCodeMapping[reason.code];
            const color = reason.color ? reason.color : '';
            Agent.stateDict[_notReadyStateKey] = { name: reason.name, rawState: AgentState.NOTREADY, reason: reason.code, color };
        }
    }

    /**
     * 设置服务器自定义状态
     * @param stateList
     */
    static setRemoteCustomReason(stateList) {
        for (const item of stateList) {
            const _notReadyStateKey = Agent.reasonCodeMapping[item.reasonCode];
            if (!_notReadyStateKey) {
                if (Agent.stateDict[item.key]) {
                    Agent.stateDict[item.key].name = item.name;
                }
            } else {
                Agent.stateDict[_notReadyStateKey] = { name: item.name, rawState: AgentState.NOTREADY, reason: item.reasonCode };
            }
        }

    }

    /**
     * 将服务器状态值转化为本系统可读的值
     *
     * @param rawState
     * @param reason  0 整理；1 通话；2 话机不可用；3 示忙；4 离开；5 休息；6 振铃
     * @returns {string}
     */
    static convertToLocalState(rawState, reason) {
        let state = Agent.OFFLINE;
        if (rawState === AgentState.NOTREADY) {
            switch (reason) {
                case 0:
                    state = Agent.NEATENING;
                    break;
                case 1:
                    state = Agent.TALKING;
                    break;
                case 3:
                    state = Agent.BUSY;
                    break;
                case 5:
                    state = Agent.REST;
                    break;
                case 6:
                    state = Agent.RINGING;
                    break;
                case 11:
                    state = Agent.REASON1;
                    break;
                case 12:
                    state = Agent.REASON2;
                    break;
                case 13:
                    state = Agent.REASON3;
                    break;
                case 14:
                    state = Agent.REASON4;
                    break;
                case 15:
                    state = Agent.REASON5;
                    break;
                case 17:
                    state = Agent.REASON7;
                    break;

                default:
                    state = Agent.BUSY;
                    break;
            }
        } else if (rawState === AgentState.READY) {
            state = Agent.READY;
        } else if (rawState === AgentState.OFFLINE) {
            state = Agent.OFFLINE;
        }
        return state;
    }

    /**
     * 将本地状态值转换为原始服务器状态值
     * @param state
     * @returns {*|null}
     */
    static convertToRawState(state) {
        return Agent.stateDict[state] || null;
    }

}

// 坐席本地状态常量
Agent.OFFLINE = 'offline';
Agent.READY = 'ready';
Agent.BUSY = 'busy';
Agent.REST = 'rest';
Agent.NEATENING = 'neatening';
Agent.TALKING = 'talking';
Agent.RINGING = 'ringing';
Agent.REASON1 = 'reason1';
Agent.REASON2 = 'reason2';
Agent.REASON3 = 'reason3';
Agent.REASON4 = 'reason4';
Agent.REASON5 = 'reason5';
Agent.REASON7 = 'reason7';

// 允许修改的状态
Agent.allowModifyStates = [
    Agent.READY,
    Agent.BUSY,
    Agent.REST,
    Agent.REASON1,
    Agent.REASON2,
    Agent.REASON3,
    Agent.REASON4,
    Agent.REASON5,
    Agent.REASON7
];

/* 状态字典 */
Agent.stateDict = {
    [Agent.OFFLINE]: {name: '离线', rawState: AgentState.OFFLINE, reason: NotReadyReason.UNKNOWN},
    [Agent.READY]: {name: '就绪', rawState: AgentState.READY, reason: NotReadyReason.UNKNOWN},
    [Agent.BUSY]: {name: '示忙', rawState: AgentState.NOTREADY, reason: NotReadyReason.BUSY},
    [Agent.REST]: {name: '休息中', rawState: AgentState.NOTREADY, reason: NotReadyReason.REST},
    [Agent.NEATENING]: {name: '整理中', rawState: AgentState.NOTREADY, reason: NotReadyReason.NEATENING},
    [Agent.TALKING]: {name: '通话中', rawState: AgentState.NOTREADY, reason: NotReadyReason.TALKING},
    [Agent.RINGING]: {name: '振铃中', rawState: AgentState.NOTREADY, reason: NotReadyReason.RINGING},
};

/* 自定义坐席状态映射 */
Agent.reasonCodeMapping = {
    [NotReadyReason.BUSY]: Agent.BUSY,
    [NotReadyReason.REST]: Agent.REST,
    [NotReadyReason.NEATENING]: Agent.NEATENING,
    [NotReadyReason.REASON1]: Agent.REASON1,
    [NotReadyReason.REASON2]: Agent.REASON2,
    [NotReadyReason.REASON3]: Agent.REASON3,
    [NotReadyReason.REASON4]: Agent.REASON4,
    [NotReadyReason.REASON5]: Agent.REASON5,
    [NotReadyReason.REASON7]: Agent.REASON7
};

export default Agent;
