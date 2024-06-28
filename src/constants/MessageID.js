/**
 * 话务平台通信消息类型常量
 */
export const MessageID = {
    // 坐席状态变更指令
    RequestAgentLogin: 100,
    RequestAgentReady: 101,
    RequestAgentNotReady: 102,
    RequestAgentLogout: 103,
    // 电话控制指令
    RequestMakeCall: 200,
    RequestAnswerCall: 201,
    RequestBridgeCall: 202, // 排队中接听
    RequestReleaseCall: 203,
    RequestHoldCall: 204,
    RequestRedirectCall: 212,
    RequestClearCall: 213,
    RequestSingleStepConference: 214,
    RequestSingleStepTransfer: 215,
    RequestDeleteFromConference: 216,
    RequestRetrieveCall: 217,
    RequestInitiateConference: 220,
    RequestInitiateTransfer: 221,
    RequestCompleteConference: 222,
    RequestCompleteTransfer: 223,
    RequestTransferToIVR: 224,
    RequestSendDtmf: 250,
    RequestAttachUserData: 230,
    RequestDeleteUserData: 231,
    RequestUpdateUserData: 232,
    RequestRegisterAddress: 261,
    RequestUnregisterAddress: 263,
    RequestMonitorCall: 265,
    RequestQueryAgentStatus: 266,
    RequestQueueState: 270,
    RequestSysSettingsUpdate: 300,
    RequestRecordList: 3001,
    // 监控
    RequestMonitorAgentList:3201,
    RequestAutoReadyConfig:3601,

    // 响应事件
    EventWelcome: 2,
    EventPong: 3,
    // 坐席状态变更事件
    EventAgentLogin: 580,
    EventAgentLogout: 581,
    EventAgentNotReady: 582,
    EventAgentReady: 583,
    // 电话控制事件
    EventQueued: 501,
    EventRinging: 503,
    EventAbandoned: 504,
    EventDialing: 505,
    EventEstablished: 506,
    EventAttachedDataChanged: 507,
    EventDtmfSent: 508,
    EventHeld: 509,
    EventPartyAdded: 510,
    EventPartyChanged: 511,
    EventPartyDeleted: 512,
    EventRetrieved: 513,
    EventReleased: 515,
    EventThreeWayEstablished: 519,
    EventThreeWayReleased: 518,
    EventOcbNumberInfo: 521,
    EventPartyInfo: 520,
    EventSysSettingsUpdate: 526,
    EventAgentInfo: 588,
    EventRegistered: 572,
    EventUnregistered: 574,
    EventLinkConnected: 590,
    EventLinkDisconnected: 4500,
    EventReportInfo: 2500,
    EventCampaignLoaded: 1500,
    EventCampaignUnloaded: 1501,
    EventDialingStarted: 1502,
    EventDialingStopped: 1503,
    EventUpdateTenantIP: 1504,
    EventCampaignRatio: 1507,
    EventOutboundInfo: 1509,
    EventCampaignLoadByFileName: 1510,
    EventRetrieveCampaign: 1511,
    EventCallLoss: 1512,
    EventCallLossDownCSV: 1513,
    EventCampaignContactDownCSV: 1514,
    EventCampaignLoadByCId: 1515,
    // EventDownRecord: 3501,
    // EventRecordList: 3502,
    RequestCrm4TransferAgent: 3501, // 请求转接坐席数据
    CrmTransferAgentInfo: 3502, // 需要转接的座席信息
    RequestCrm4GroupLis: 3505, // 请求班组列表
    CrmGroupList: 3506, // 班组列表
    RequestCrm4QueueList: 3507, // 请求技能组列表
    CrmQueueList: 3508, // 技能组列表
    RequestCrm4ConferenceAgent: 3509, // 请求会议数据
    CrmConferenceAgentInfo: 3510, // 会议数据
    EventTransferMenuList: 3101,
    EventConferenceMenuList: 3102,
    EventAutoReadyConfig: 3103,
    // 重置技能组结果
    EventResetQueue: 3302,
    // 监控
    EventMonitorAgentList:3202,
    RequestCrmQueueMonitorInfo:3203,
    CrmQueueMonitorAttr:3204,
    RequestStartQueueMonitoring:268,
    RequestStopQueueMonitoring:269,
    EventQueueStatisticA:540,
    EventQueueStatisticB:541,
    EventQueuedCustomerIn:542,
    EventQueuedCustomerOut:543,
    RequestJumpTheQueue:302,

    // 错误事件
    EventError: 9999,
};
