// Import Models
import { Point } from "@fluentui/utilities";

export enum PopoverType {
    Warning = 'warning',
    Menu = 'menu'
}

export interface PopoverData {
    type: PopoverType;
    isVisible: boolean;
    target?: Point | string | undefined;
    onAsset?: boolean;
    assetId: number;
    assetType?: string;
    coords?: Array<number>;
    deskName?:string;
}