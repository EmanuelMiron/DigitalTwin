export enum AssetType {
    Default = 'default',
}


export interface AssetsData {
    type: AssetType;
    [key : string]: any;
}


