// src/types/pdfjs.d.ts (TYPE DECLARATIONS FOR PDF.JS)

declare module 'pdfjs-dist' {
  export interface PDFDocumentProxy {
    numPages: number;
    getPage(pageNumber: number): Promise<PDFPageProxy>;
  }

  export interface PDFPageProxy {
    getTextContent(params?: any): Promise<TextContent>;
    getViewport(params: { scale: number }): PageViewport;
  }

  export interface TextContent {
    items: TextItem[];
  }

  export interface TextItem {
    str: string;
    hasEOL?: boolean;
    transform?: number[];
  }

  export interface PageViewport {
    width: number;
    height: number;
  }

  export interface LoadingTask {
    promise: Promise<PDFDocumentProxy>;
  }

  export interface GlobalWorkerOptions {
    workerSrc: string;
  }

  export const GlobalWorkerOptions: GlobalWorkerOptions;

  export function getDocument(params: {
    data?: Uint8Array | Buffer;
    url?: string;
    verbosity?: number;
    disableFontFace?: boolean;
    disableRange?: boolean;
    disableStream?: boolean;
  }): LoadingTask;
}

declare module 'pdfjs-dist/legacy/build/pdf.js' {
  export * from 'pdfjs-dist';
}

declare module 'pdfjs-dist/legacy' {
  export * from 'pdfjs-dist';
}

declare module 'pdfjs-dist/build/pdf.js' {
  export * from 'pdfjs-dist';
}

// Global declarations for Node.js environment
declare global {
  var window: any;
  var document: any;
  var navigator: any;
}