export interface JikanResponse<T> {
  data: T;
  pagination: {
    has_next_page: boolean;
    current_page?: number;
    last_visible_page?: number;
  };
}

export interface JikanImage {
  jpg?: { image_url?: string };
  webp?: { image_url?: string };
}

export interface JikanBase {
  mal_id: number;
  url?: string;
  images?: JikanImage;
}
