export interface ActionButtonDefinition {
    name: string;
    backgroundColor: string;
    foregroundColor: string;
    icon: string;
    alignment: "top-left" | "top-center" | "top-right" | "bottom-left" | "bottom-center" | "bottom-right";
    effectList: any;
    extraMetadata?: string;
}

export interface ActionButtonDisplay {
    uuid: string;
    name: string;
    backgroundColor: string;
    foregroundColor: string;
    icon: string;
    alignment: "top-left" | "top-center" | "top-right" | "bottom-left" | "bottom-center" | "bottom-right";
    hidden?: boolean;
}
