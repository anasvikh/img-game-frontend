import { IPlayerResultsModel } from './roundResults.model';

export interface IGameboardPointModel {
    players: IPlayerResultsModel[];
    pointNumber: number;
    pointPosition: number;
}