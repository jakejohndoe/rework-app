// src/types/pdf-poppler.d.ts
declare module 'pdf-poppler' {
  interface ConvertOptions {
    format: 'jpeg' | 'png' | 'pdf';
    out_dir: string;
    out_prefix: string;
    page?: number;
    scale?: number;
  }

  function convert(pdfPath: string, options: ConvertOptions): Promise<string[]>;
  
  export = { convert };
}