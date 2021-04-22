export interface IUserModel {
    name: string;
    chipId: number;
    order?: number;
}

export interface IUserResultsModel extends IUserModel {
    isCardOwner: boolean;
}