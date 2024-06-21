/**
 * 坐席把状态至于NotReady的原因
 */
export const NotReadyReason = {
    /*未知*/
    UNKNOWN: -1,
    /*整理中*/
    NEATENING: 0,
    /*通话中*/
    TALKING: 1,
    /*未注册,话机不可用*/
    DEVICE_UNAVAILABLE: 2,
    /*示忙*/
    BUSY: 3,
    /*暂时离开*/
    WALK_AWAY: 4,
    /*休息中*/
    REST: 5,
    /*振铃*/
    RINGING: 6,
    /*自定义1*/
    REASON1: 11,
    /*自定义2*/
    REASON2: 12,
    /*自定义3*/
    REASON3: 13,
    /*自定义4*/
    REASON4: 14,
    /*自定义5*/
    REASON5: 15,
    /*自定义7*/
    REASON7: 17,

};
