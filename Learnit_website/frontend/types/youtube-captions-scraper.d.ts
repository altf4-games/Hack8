// Create this file at: src/types/youtube-captions-scraper.d.ts

declare module 'youtube-captions-scraper' {
    interface CaptionTrack {
      start: number;
      dur: number;
      text: string;
    }
  
    interface GetSubtitlesOptions {
      videoID: string;
      lang?: string;
    }
  
    export function getSubtitles(options: GetSubtitlesOptions): Promise<CaptionTrack[]>;
  }