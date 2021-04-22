import { ChipColorEnum } from './enums/chip-color.enum';
import { ICardResultsModel } from './card.model';

export interface IRoundResultsModel {
    activePlayCard: ICardResultsModel;
    resultsList: IPlayerResultsModel[];
}

export interface IPlayerResultsModel {
    username: string;
    roundPoints: number;
    totalPoints: number;
    chipColor: ChipColorEnum;
}