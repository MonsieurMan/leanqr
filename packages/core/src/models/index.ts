import { ErrorCorrectionLevel, ErrorCorrectionLevelBits } from "../error-correction/error-correction-level";

export interface Modules {
	size: number;
	data: Uint8Array;
	reservedBit: Uint8Array;
}

export interface EncodedQRCode {
	modules: Modules;
	version: number;
	errorCorrectionLevel: ErrorCorrectionLevelBits;
	maskPattern: number | undefined;
	segments: any[]; // ByteData
}

interface EncodingOptionInternal {
	version: number;
	maskPattern: number;
	margin: number;
	scale: number;
	width: number;
	type: string;
	color: {
		light?: string;
		dark?: string;
	};
	rendererOpts: any;
	toSJISFunc: () => any;
	errorCorrectionLevel: ErrorCorrectionLevel;
}

export type EncodingOption = Partial<EncodingOptionInternal>;
