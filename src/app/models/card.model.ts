import { IUserResultsModel } from './user.model';

export interface ICardModel {
    id: number;
    src: string;
    numberInSet: number;
}

export interface ICardResultsModel extends ICardModel {
    players: IUserResultsModel[];
}