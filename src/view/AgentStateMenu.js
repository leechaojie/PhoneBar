import EventEmitter from 'eventemitter3';
import utils from "../utils/utils";
import Agent from "../model/Agent";
import {AgentState, CallType, NotReadyReason} from '../constants';

let autoIncrementId = 0;

/**
 * 用户状态UI组件
 */
class AgentStateMenu extends EventEmitter {

    constructor({
                    visible = true,
                    enabled = true,
                    onAgentStateSelected
                } = {}) {
        super();

        this.id = `agentState-${autoIncrementId++}`;
        this._selectedState = Agent.OFFLINE;
        this._className = 'operation call';
        this._textClassName = 'operation_text';
        this._openClassName = 'open';

        /*
        * 所有可操作动作
        * */
        this.actionList = [];
        const predefinedMenu = [
            { name: '离线', value: 'logout', visible: false, color: '#a1a2a2' },
            { name: '登入', value: 'login', visible: true, color: '#f8ac59' },
        ]

        // 组装下拉菜单
        for (const stateKey in Agent.stateDict) {
            if (Agent.allowModifyStates.includes(stateKey)) {
                const item = {
                    name: Agent.stateDict[stateKey].name,
                    value: stateKey === 'offline' ? 'logout' : stateKey,
                    visible: stateKey === 'offline' ? false : true,
                    color: Agent.stateDict[stateKey].color ? Agent.stateDict[stateKey].color : ''
                }
                this.actionList.push(item);
            }

        }

        this.actionList.push(...predefinedMenu);

        this._visible = visible;
        this._enabled = enabled;
        this._disabledClassName = 'disabled';

        utils.isFunction(onAgentStateSelected) && this.on('agentStateSelected', onAgentStateSelected);

        this.create();
    }

    create() {
        if (!this.rootNode) {
            let rootNode = this.rootNode = document.createElement('li');
            rootNode.id = this.id;
            rootNode.className = this._className;

            rootNode.appendChild(this.generateIconNode());
            rootNode.appendChild(this.generateTextNode());
            rootNode.appendChild(this._generateDropdownMenuNode());

            this._visible || this.hide();

            rootNode.onclick = (e) => {this._toggleDropdownMenu(e);};
            document.addEventListener('click', this.onBodyClick = this._hideDropdownMenu.bind(this));
        }
    }


    generateIconNode() {
        let iconNode = this.agentStateIcon = document.createElement('span');
        iconNode.className = `agentstate-${this._selectedState}`;
        return iconNode;
    }

    generateTextNode() {
        let textNode = document.createElement('div');
        textNode.className = this._textClassName;
        let agentStateText = this.agentStateText = document.createElement('span');
        agentStateText.innerText = Agent.getStateName(this._selectedState);
        let agentStateTimer = this.agentStateTimer = document.createElement('span');
        agentStateTimer.innerText = '00:00';
        textNode.appendChild(agentStateText);
        textNode.appendChild(agentStateTimer);

        return textNode;
    }

    _generateDropdownMenuNode() {
        let menuList = this._dropdownMenuNode = document.createElement('ul');
        menuList.className = 'dropdown-menu';
        menuList.style.display = 'none';

        this._actionElementMap = {};
        this.actionList.forEach((action) => {
            const menu = document.createElement('li');
            menu.id = action.value
            // 默认是否显示
            if (!action.visible) {
                menu.style.display = 'none';
            }
            // 选择后不直接更新显示结果，而是触发agentStateSelected事件，由监听控制修改。
            menu.onclick = () => {this.emit('agentStateSelected', action.value);};

            let icon = document.createElement('i');
            icon.className = action.value;
            if (action.color) {
                icon.style.background = action.color;
            }
            let textSpan = document.createElement('span');
            textSpan.innerText = action.name;

            menu.appendChild(icon);
            menu.appendChild(textSpan);
            menuList.appendChild(menu);
            this._actionElementMap[action.value] = menu;
        });

        return menuList;
    }

    _hideDropdownMenu() {
        let _visible = this._dropdownMenuNode.style.display !== 'none';
        if (_visible) {
            this._dropdownMenuNode.style.display = 'none';
            if (this.rootNode.classList.contains(this._openClassName)){
                this.rootNode.classList.remove(this._openClassName);
            }
        }
    }
    _toggleDropdownMenu(e) {
        let _visible = this._dropdownMenuNode.style.display !== 'none';
        if (_visible) {
            this._hideDropdownMenu();
        } else {
            this._dropdownMenuNode.style.display = 'block';
            this.rootNode.classList.add(this._openClassName);
        }
        e.stopPropagation();
    }

    setAgentStateTimer(timeValue) {
        this.agentStateTimer.innerText = timeValue;
    }

    changeAgentState(state) {
        console.log('state', state);
        this._selectedState = state;

        // 自定义状态设置为 rest
        const customState = ['reason1', 'reason2', 'reason3', 'reason4', 'reason5', 'reason7'];
        if (customState.includes(state)) {
            this.agentStateIcon.className = `agentstate-rest`;
        } else {
            this.agentStateIcon.className = `agentstate-${state}`;
        }
        this.agentStateText.innerText = Agent.getStateName(state);

        // 当点击离线时隐藏离线选项，显示登入选项
        if (state === Agent.OFFLINE) {
            this._actionElementMap['logout'].style.display = 'none';
            this._actionElementMap['login'].style.display = 'block';
        } else if (state === Agent.BUSY) {
            this._actionElementMap['login'].style.display = 'none';
            this._actionElementMap['logout'].style.display = 'block';
        }
    }

    destroy() {
        if (this.rootNode && this.rootNode.parentNode) {
            this.rootNode.parentNode.removeChild(this.rootNode);
        }

        this.removeAllListeners('agentStateSelected');
        document.removeEventListener('click', this.onBodyClick);
    }

    show() {
        this.rootNode.style.display = 'block';
        return this;
    }

    hide() {
        this.rootNode.style.display = 'none';
        return this;
    }

}

export default AgentStateMenu;
