import { ChipColorEnum } from './enums/chip-color.enum';
import { ICardModel } from './card.model';
export interface IRoundResultsModel {
    activePlayCard: ICardModel;
    resultsList: IPlayerResultsModel[];
}

export interface IPlayerResultsModel {
    username: string;
    roundPoints: number;
    totalPoints: number;
    chipColor: ChipColorEnum;
}