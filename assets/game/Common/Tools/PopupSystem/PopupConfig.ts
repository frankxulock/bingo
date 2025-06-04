import { PopupAnimationType } from "./PopupAnimationComponent";

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
}