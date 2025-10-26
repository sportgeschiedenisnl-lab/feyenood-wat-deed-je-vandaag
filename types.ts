
export interface WikimediaImage {
  pageid: number;
  title: string;
  url: string;
  descriptionurl: string;
  description: string;
  date: string; // YYYY-MM-DD format
}

export interface WikimediaApiPage {
  pageid: number;
  ns: number;
  title: string;
  imageinfo: {
    url: string;
    descriptionurl: string;
    extmetadata: {
      DateTimeOriginal?: { value: string };
      ImageDescription?: { value: string };
    };
  }[];
}

export interface EventGroup {
  date: string; // YYYY-MM-DD
  images: WikimediaImage[];
}

export interface ProcessedEvent {
  date: string;
  headline: string;
  matchInfo: string;
  image: WikimediaImage;
  wikimediaUrl: string;
  photoCount: number;
}