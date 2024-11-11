export default class AgentConfig {
    get tipTime(): number;
    set tipTime(value: number);

    get autoIdleWhenAfterWork(): boolean | null;
    set autoIdleWhenAfterWork(value: boolean | null);

    get maxAfterWorkTime(): number;
    set maxAfterWorkTime(value: number);

    get autoIdleWhenLogin(): boolean;
    set autoIdleWhenLogin(value: boolean);

    get isPhoneTakeAlong(): boolean;
    set isPhoneTakeAlong(value: boolean);

    get workPhone(): string;
    set workPhone(value: string);

    get autoAnswer(): boolean;
    set autoAnswer(value: boolean);


    set(key: string, value: any): void;
}