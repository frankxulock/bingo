import Singleton from "../../Tools/Base/Singleton";
import MegaDataManager from "./MegaDataManager";

const { ccclass } = cc._decorator;

@ccclass
export default class CardNumberManager extends Singleton {

    private confirmedPurchaseCards: (number | null)[][] = [];
    private ownedCards: (number | null)[][] = [];

    /** 新增卡片 */
    public addCard(numbers: (number | null)[]): void {
        this.ownedCards.push(numbers);
    }

    /** 根據資料產生卡片（支援隨機卡片與 DIY 卡片） */
    public createPurchaseCards(data: any) {
        const cards = [];

        if (data.cardInfo && Array.isArray(data.cardInfo)) {
            // DIY 卡片處理
            for (const item of data.cardInfo) {
                cards.push({
                    cardId: item.cardId,
                    numbers: item.cardInfo,
                    cardState: data.cardState,
                    cardContent: data.cardContent,
                    playState: data.playState,
                });
            }
            console.log("DIY Card =>", cards);
        } else {
            // 隨機卡片處理
            const count = data.readyBuy || 0;
            for (let i = 0; i < count; i++) {
                cards.push({
                    cardId: this.generateCardID(),
                    numbers: this.generateUniqueCardNumbersFlat(),
                    cardState: data.cardState,
                    cardContent: data.cardContent,
                    playState: data.playState,
                });
            }
        }

        MegaDataManager.getInstance().ConfirmPurchaseResponse(cards);
    }

    /** 模擬Server處理更新數據 */
    public SnedChangeCardData(data) {
        for(let i = 0; i < data.length; i++) {
            data[i].numbers = this.generateUniqueCardNumbersFlat(); // 陣列
        }
        MegaDataManager.getInstance().ConfirmPurchaseResponse(data);
    }

    /** 生成唯一卡片ID */
    public generateCardID(): string {
        return crypto.randomUUID();;
    }

    /**
     * 生成不重複的賓果卡數據（25 格，中間為 null）
     * @param existingCards 已擁有的卡片集合
     */
    public generateUniqueCardNumbersFlat(): number[] {
        const getRandom = (range: number[], count: number): number[] =>
            this.shuffle(range).slice(0, count).sort((a, b) => a - b);
    
        const isDuplicate = (card: (number | null)[]): boolean => {
            const isSameCard = (a: (number | null)[]) =>
                a.every((val, i) => val === card[i]);
        
            return this.confirmedPurchaseCards.some(isSameCard) ||
                   this.ownedCards.some(isSameCard);
        };
    
        let newCard: (number | null)[] = [];
        let attempts = 0;
        const MAX_ATTEMPTS = 1000;
    
        do {
            const columns = [
                ...getRandom(this.range(1, 15), 5),
                ...getRandom(this.range(16, 30), 5),
                ...getRandom(this.range(31, 45), 5),
                ...getRandom(this.range(46, 60), 5),
                ...getRandom(this.range(61, 75), 5),
            ];
            columns[12] = null;
            
            newCard = columns;
            attempts++;
        } while (isDuplicate(newCard) && attempts < MAX_ATTEMPTS);
    
        if (attempts >= MAX_ATTEMPTS) {
            console.warn('無法在限制次數內生成不重複的賓果卡。');
        }
    
        // 記錄到 confirmedPurchaseCards
        this.confirmedPurchaseCards.push(newCard);
    
        return newCard;
    }
    

    /** 工具：範圍陣列 */
    public range(start: number, end: number): number[] {
        return Array.from({ length: end - start + 1 }, (_, i) => i + start);
    }

    /** 工具：洗牌 */
    public shuffle(array: number[]): number[] {
        const result = array.slice();
        for (let i = result.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [result[i], result[j]] = [result[j], result[i]];
        }
        return result;
    }

    /** 清除所有卡片 */
    public clearConfirmedPurchaseCards() {
        this.ownedCards = [];
    }

    /** 清除所有卡片 */
    public clearOwnedCards() {
        this.ownedCards = [];
    }
}