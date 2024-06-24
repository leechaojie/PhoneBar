import '../css/dialpad.css';
import utils from "../utils/utils";
import Dialog from "./Dialog";

/**
 * 拨号盘UI控件
 */
class DialPad extends Dialog {

    constructor({
                    title = '',
                    contacts = [],
                    dynamicButton,
                    onHangupButtonClick
                }) {
        super({title});
        this._contacts = contacts;
        this.dynamicButton = dynamicButton;
        this.setContent(this._generateContentNode());

        utils.isFunction(onHangupButtonClick) && this.on('hangupButtonClick', onHangupButtonClick);
    }

    /**
     * 生成号码盘内容部分
     * @returns {HTMLDivElement}
     * @private
     */
    _generateContentNode() {
        let contentNode = document.createElement('div');
        contentNode.className = 'dialpad clearfix';
        contentNode.onselectstart = () => {
            return false
        };

        if (this._contacts.length > 0) {
            contentNode.appendChild(this._generateContactSelectNode());
        }
        contentNode.appendChild(this._generatePhoneNumberNode());
        contentNode.appendChild(this._generateNumberPadNode());
        contentNode.appendChild(this._generateCallControllerNode());
        return contentNode;
    }

    /**
     * 生成联系人选择框节点
     * @returns {HTMLSelectElement}
     * @private
     */
    _generateContactSelectNode() {
        let contactSelectNode = document.createElement('select');
        contactSelectNode.className = 'single-line select_width';
        let options = '<option value="">--请选择电话号码--</option>';
        this._contacts.forEach((_contact) => {
            options += `<option value="${_contact.agentId}">${_contact.name}</option>`;
        });
        contactSelectNode.innerHTML = options;
        contactSelectNode.onchange = () => {
            contactSelectNode.value && (this.setPhoneNumber(contactSelectNode.value));
        };
        return contactSelectNode;
    }

    /**
     * 生成电话号码输入栏
     * @returns {HTMLDivElement}
     * @private
     */
    _generatePhoneNumberNode() {
        const phoneNumberParentNode = document.createElement('div');
        phoneNumberParentNode.className = 'input-group';

        // 电话号码输入框
        const phoneNumberNode = document.createElement('div');
        phoneNumberNode.className = 'phoneNumber';
        const phoneNumberTextField = this._phoneNumberTextField = document.createElement('input');
        phoneNumberTextField.type = 'text';
        phoneNumberTextField.setAttribute('autocomplete', 'off');
        phoneNumberTextField.className = 'number';
        phoneNumberTextField.name = 'phoneNumber';
        const phoneNumberClearBtn = document.createElement('div');
        phoneNumberClearBtn.className = 'clear';
        phoneNumberClearBtn.innerHTML = '<i class="icon-clear"></i>';
        phoneNumberClearBtn.onclick = () => {
            this.setPhoneNumber('');
            phoneNumberClearBtn.style.display = 'none';
        }
        phoneNumberTextField.oninput = () => {
            if (this._phoneNumberTextField.value) {
                phoneNumberClearBtn.style.display = 'block';
            } else {
                phoneNumberClearBtn.style.display = 'none';
            }
        }
        phoneNumberTextField.onblur = () => {
            setTimeout(() => {
                this._phoneNumberTextField.scrollLeft = this._phoneNumberTextField.scrollWidth;
            }, 0);
        }
        phoneNumberNode.appendChild(phoneNumberTextField);
        phoneNumberNode.appendChild(phoneNumberClearBtn);

        // 号码盘显示隐藏切换按钮
        let slideDialPadBtn = document.createElement('button');
        slideDialPadBtn.type = 'button';
        slideDialPadBtn.className = 'cc-btn btn-white slidedialpad';
        slideDialPadBtn.title = '数字键盘';
        slideDialPadBtn.innerHTML = '<i class="icon-slidedialpad"></i>';
        slideDialPadBtn.onclick = this.toggleExpandNumberPad.bind(this);

        phoneNumberParentNode.appendChild(phoneNumberNode);
        phoneNumberParentNode.appendChild(slideDialPadBtn);
        return phoneNumberParentNode;
    }

    toggleExpandNumberPad() {
        let _visible = this.numberPadNode.style.display !== "none";
        if (_visible) {
            this.numberPadNode.style.display = 'none';
        } else {
            this.numberPadNode.style.display = 'block';
        }
    }

    setPhoneNumber(phoneNmuber) {
        this._phoneNumberTextField.value = phoneNmuber;
    }

    getPhoneNumber() {
        return this._phoneNumberTextField.value || '';
    }

    /**
     * 生成数字号码盘节点
     * @returns {HTMLUListElement}
     * @private
     */
    _generateNumberPadNode() {
        let numberPadNode = this.numberPadNode = document.createElement('ul');
        numberPadNode.className = 'numberpad clearfix';
        numberPadNode.style.display = 'none';

        for (let i = 1; i <= 12; i++) {
            let keyButton = document.createElement('li');
            switch (i) {
                case 10:
                    keyButton.innerText = '*';
                    break;
                case 11:
                    keyButton.innerText = 0;
                    break;
                case 12:
                    keyButton.innerText = '#';
                    break;
                default:
                    keyButton.innerText = i;
                    break;
            }
            keyButton.onmousedown = (e) => {
                this._onKeyMousedown(e, keyButton.innerText)
            };
            numberPadNode.appendChild(keyButton);
        }

        return numberPadNode;
    }

    _onKeyMousedown(e, number) {
        e.preventDefault();
        this.setPhoneNumber(this.getPhoneNumber() + number);
        this._phoneNumberTextField.dispatchEvent(new Event('input'));
        this._phoneNumberTextField.scrollLeft = this._phoneNumberTextField.scrollWidth;
        this._phoneNumberTextField.focus();
    }

    /**
     * 生成控制按钮，包含拨号、清除、挂断、咨询、转出
     * @returns {HTMLUListElement}
     * @private
     */
    _generateCallControllerNode() {
        const ctlBtnNode = document.createElement('ul');
        ctlBtnNode.className = 'clearfix';

        // 挂机键
        const hangupButton = document.createElement('li');
        hangupButton.className = 'hangup';
        hangupButton.title = '挂断';
        hangupButton.innerHTML = '<i class="icon-hangup"></i>';
        hangupButton.onclick = () => {
            this.emit('hangupButtonClick');
        };
        if (this.dynamicButton) {
            ctlBtnNode.appendChild(this.dynamicButton);
        }
        ctlBtnNode.appendChild(hangupButton);
        return ctlBtnNode;
    }

    static createButton({
                            id,
                            tagName = 'li',
                            btnName,
                            className,
                            onClick
                        }) {
        const button = document.createElement(tagName);
        id && (button.id = id);
        className && (button.className = className);
        btnName && (button.title = btnName);
        button.innerHTML = '<i class="icon-answer"></i>';
        utils.isFunction(onClick) && (button.onclick = onClick);
        return button;
    }

    destroy() {
        super.destroy();
        this.removeAllListeners('hangupButtonClick');
    }
}

export default DialPad;
