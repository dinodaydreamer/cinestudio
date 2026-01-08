
export enum CameraBody {
  IMAX = "IMAX Film Camera",
  RED_VRAPTOR = "RED V-RAPTOR (VV / S35)",
  SONY_VENICE = "Sony CineAlta VENICE",
  ARRI_ALEXA_35 = "ARRI ALEXA 35",
  ARRI_16SR = "ARRI Arriflex 16SR (16mm Film)",
  PANAVISION_DXL2 = "Panavision Millennium DXL2"
}

export enum LensType {
  ZEISS_ULTRA = "Zeiss Ultra Prime",
  COOKE_S4 = "Cooke S4 / S4i",
  ARRI_SIGNATURE = "ARRI Signature Prime",
  CANON_K35 = "Canon K-35",
  PANAVISION_C = "Panavision C-Series",
  HAWK_VLITE = "Hawk V-Lite",
  JDC_XTAL = "JDC Xtal Xpress",
  LENSBABY = "Lensbaby",
  PETZVAL = "Petzval",
  LAOWA_MACRO = "Laowa Macro"
}

export enum CameraAngle {
  TOP_DOWN = "Top-Down (Aerial / Flycam)",
  HIGH_ANGLE = "High Angle",
  EYE_LEVEL = "Eye-Level (Front View)",
  LOW_ANGLE = "Ultra Low Angle (Hero Shot)",
  SIDE_PROFILE = "Side Profile",
  THREE_QUARTER = "Three-Quarter Angle",
  FROM_BEHIND = "From Behind",
  OVER_SHOULDER = "Over-the-Shoulder"
}

export type FocalLength = 8 | 12 | 18 | 25 | 35 | 50 | 75 | 85 | 100 | 135;

export type AspectRatio = "1:1" | "3:4" | "4:3" | "9:16" | "16:9";

export type ImageSize = "1K" | "2K" | "4K";

export interface GeneratedImage {
  id: string;
  url: string;
  prompt: string;
  settings: {
    camera: CameraBody;
    lens: LensType;
    focalLength: FocalLength;
    angle: CameraAngle;
    ratio: AspectRatio;
    size: ImageSize;
  };
  timestamp: number;
}

export interface RefImage {
  id: string;
  data: string; // base64
  mimeType: string;
}
