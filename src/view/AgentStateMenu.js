import EventEmitter from 'eventemitter3';
import utils from "../utils/utils";
import Agent from "../model/Agent";

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
            { name: '离线', value: 'logout', visible: false, color: '#f8ac59' },
            { name: '登入', value: 'login', visible: true, color: '#f8ac59' }
        ]
        // 组装下拉菜单
        for (const stateKey in Agent.stateDict) {
            if (Agent.allowModifyStates.includes(stateKey)) {
                const item = {
                    name: Agent.stateDict[stateKey].name,
                    value: stateKey,
                    visible: true,
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
        // } else if (state === Agent.BUSY) { // 注释此行代码，为了解决状态为整理中等非示忙状态时，页面刷新后菜单栏离线按钮变成登入的问题
        } else {
            this._actionElementMap['login'].style.display = 'none';
            this._actionElementMap['logout'].style.display = 'block';
        }
    }

    /**
    * 合并更新远程状态列表
    * @param {Array} newData 新状态数据
    */
    mergeRemoteActionList(newData) {
        const remoteActionList = [];
        newData.forEach(item => {
            const action = {
                name: item.name,
                value: item.key,
                visible: true,
                color: item.color
            }
            remoteActionList.push(action);
        });

        remoteActionList.forEach(action => {
            const list = this.actionList.find(item => item.value === action.value);
            if (list) {
                list.name = action.name;
                list.visible = action.visible;
                list.color = action.color;
            } else {
                this.actionList.splice(-2, 0, action);
            }
        });

        // 如果已经创建了 DOM，则需要重新生成下拉菜单
        if (this.rootNode) {
            this.rootNode.removeChild(this._dropdownMenuNode);
            this.rootNode.appendChild(this._generateDropdownMenuNode());
        }

        Agent.setRemoteCustomReason(newData);
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
