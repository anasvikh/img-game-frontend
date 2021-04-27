export interface ILookupModel {
    id: number;
    value: string;
    isChecked: boolean;
}
export interface ICardSetsResponseModel {
    groupName: string;
    items: ILookupModel[];
}