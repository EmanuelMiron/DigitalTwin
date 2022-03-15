export enum DialogType {
    DeleteConfirmation = 'deleteConfirmation',
    CreateAsset = 'createAsset',
    EditAsset = 'editAsset',
    BookDesk = 'bookdesk',
    LogIn = 'login',
    EditAssetPosition = 'editAssetPosition'
}

export interface DialogData {
    type: DialogType;
    isVisible: boolean;
    assetId?: number;
    assetType?: string;
    coords?: Array<number>;
    newCoords? : Array<number>;
    "Desk Name"? :string;
}