import { PopupAnimationType } from "./PopupAnimationComponent";

/** 彈窗類型 */
export enum PopupType {
    None,
    LocalPopup,     // 局部彈窗
    GlobalPopup,    // 全視窗彈窗
}

export enum PopupName {
    ConfirmPurchasePage =   "ConfirmPurchasePage",
    ResultPage =            "ResultPage",
    RewardPopupPage =       "RewardPopupPage",
    DIYCardSelectionPage =  "DIYCardSelectionPage",
    DIYEditPage =           "DIYEditPage",
    CardPurchasePopupPage = "CardPurchasePopupPage",
    StreamerInfoPage =      "StreamerInfoPage",
    AllBallNumbersPage=     "AllBallNumbersPage",
    LeaderboardPage=        "LeaderboardPage",
    ChatPage=               "ChatPage",
    PersonalCenterPage=     "PersonalCenterPage",
    GameRecordPage=         "GameRecordPage",
    BalanceTooLowPage=      "BalanceTooLowPage",
    PurchaseUpdatePage=     "PurchaseUpdatePage",
    HelpCenterPage=         "HelpCenterPage",
    DIYCardDeletePage=      "DIYCardDeletePage",
}

export const PopupPrefabPath: Record<PopupName, string> = {
    [PopupName.ConfirmPurchasePage]:        "prefab/ConfirmPurchasePage",
    [PopupName.ResultPage]:                 "prefab/ResultPage",
    [PopupName.RewardPopupPage]:            "prefab/RewardPopupPage",
    [PopupName.DIYCardSelectionPage]:       "prefab/DIYCardSelectionPage",
    [PopupName.DIYEditPage]:                "prefab/DIYEditPage",
    [PopupName.CardPurchasePopupPage]:      "prefab/CardPurchasePopupPage",
    [PopupName.StreamerInfoPage]:           "prefab/StreamerInfoPage",
    [PopupName.AllBallNumbersPage]:         "prefab/AllBallNumbersPage",
    [PopupName.LeaderboardPage]:            "prefab/LeaderboardPage",
    [PopupName.ChatPage]:                   "prefab/ChatPage",
    [PopupName.PersonalCenterPage]:         "prefab/PersonalCenterPage",
    [PopupName.GameRecordPage]:             "prefab/GameRecordPage",
    [PopupName.BalanceTooLowPage]:          "prefab/BalanceTooLowPage",
    [PopupName.PurchaseUpdatePage]:         "prefab/PurchaseUpdatePage",
    [PopupName.HelpCenterPage]:             "prefab/HelpCenterPage",
    [PopupName.DIYCardDeletePage]:          "prefab/DIYCardDeletePage",
};

// 動畫配置
export const ShowPopupAnimationConfig: Record<PopupName, PopupAnimationType> = {
    [PopupName.ConfirmPurchasePage]:    PopupAnimationType.SlideFromBottom,
    [PopupName.ResultPage]:             PopupAnimationType.SlideFromBottom,
    [PopupName.RewardPopupPage]:        PopupAnimationType.ScaleIn,
    [PopupName.DIYCardSelectionPage]:   PopupAnimationType.SlideFromBottom,
    [PopupName.DIYEditPage]:            PopupAnimationType.SlideFromLeft,
    [PopupName.CardPurchasePopupPage]:  PopupAnimationType.SlideFromBottom,
    [PopupName.StreamerInfoPage]:       PopupAnimationType.SlideFromBottom,
    [PopupName.AllBallNumbersPage]:     PopupAnimationType.SlideFromBottom,
    [PopupName.LeaderboardPage]:        PopupAnimationType.SlideFromBottom,
    [PopupName.ChatPage]:               PopupAnimationType.SlideFromBottom,
    [PopupName.PersonalCenterPage]:     PopupAnimationType.SlideFromLeft,
    [PopupName.GameRecordPage]:         PopupAnimationType.SlideFromLeft,
    [PopupName.BalanceTooLowPage]:      PopupAnimationType.ScaleIn,
    [PopupName.PurchaseUpdatePage]:     PopupAnimationType.ScaleIn,
    [PopupName.HelpCenterPage]:         PopupAnimationType.SlideFromLeft,
    [PopupName.DIYCardDeletePage]:      PopupAnimationType.SlideFromBottom,
};

export const ClosePopupAnimationConfig: Record<PopupName, PopupAnimationType> = {
    [PopupName.ConfirmPurchasePage]:    PopupAnimationType.SlideFromBottom,
    [PopupName.ResultPage]:             PopupAnimationType.SlideFromBottom,
    [PopupName.RewardPopupPage]:        PopupAnimationType.ScaleIn,
    [PopupName.DIYCardSelectionPage]:   PopupAnimationType.SlideFromBottom,
    [PopupName.DIYEditPage]:            PopupAnimationType.SlideFromLeft,
    [PopupName.CardPurchasePopupPage]:  PopupAnimationType.SlideFromBottom,
    [PopupName.StreamerInfoPage]:       PopupAnimationType.SlideFromBottom,
    [PopupName.AllBallNumbersPage]:     PopupAnimationType.SlideFromBottom,
    [PopupName.LeaderboardPage]:        PopupAnimationType.SlideFromBottom,
    [PopupName.ChatPage]:               PopupAnimationType.SlideFromBottom,
    [PopupName.PersonalCenterPage]:     PopupAnimationType.SlideFromLeft,
    [PopupName.GameRecordPage]:         PopupAnimationType.SlideFromLeft,
    [PopupName.BalanceTooLowPage]:      PopupAnimationType.ScaleIn,
    [PopupName.PurchaseUpdatePage]:     PopupAnimationType.ScaleIn,
    [PopupName.HelpCenterPage]:         PopupAnimationType.SlideFromLeft,
    [PopupName.DIYCardDeletePage]:      PopupAnimationType.SlideFromBottom,
}

export const PopupTypeConfig: Record<PopupName, PopupType> = {
    [PopupName.ConfirmPurchasePage]:    PopupType.LocalPopup,
    [PopupName.ResultPage]:             PopupType.LocalPopup,
    [PopupName.RewardPopupPage]:        PopupType.LocalPopup,
    [PopupName.DIYCardSelectionPage]:   PopupType.LocalPopup,
    [PopupName.DIYEditPage]:            PopupType.GlobalPopup,
    [PopupName.CardPurchasePopupPage]:  PopupType.LocalPopup,
    [PopupName.StreamerInfoPage]:       PopupType.LocalPopup,
    [PopupName.AllBallNumbersPage]:     PopupType.LocalPopup,
    [PopupName.LeaderboardPage]:        PopupType.LocalPopup,
    [PopupName.ChatPage]:               PopupType.LocalPopup,
    [PopupName.PersonalCenterPage]:     PopupType.LocalPopup,
    [PopupName.GameRecordPage]:         PopupType.LocalPopup,
    [PopupName.BalanceTooLowPage]:      PopupType.LocalPopup,
    [PopupName.PurchaseUpdatePage]:     PopupType.LocalPopup,
    [PopupName.HelpCenterPage]:         PopupType.LocalPopup,
    [PopupName.DIYCardDeletePage]:      PopupType.LocalPopup,
}