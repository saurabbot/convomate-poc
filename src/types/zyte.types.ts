export interface ProductInterface {
  url: string;
  statusCode: number;
  browserHtml: string;
  product: Product;
}

export interface Product {
  name: string;
  price: string;
  sku: string;
  mainImage: Image;
  images?: Image[];
  videos?: Video[];
  description: string;
  descriptionHtml: string;
  aggregateRating?: AggregateRating;
  additionalProperties?: AdditionalProperty[];
  url: string;
  canonicalUrl: string;
  metadata: Metadata;
}

export interface Image {
  url: string;
}

export interface Video {
  url: string;
}

export interface AggregateRating {
  reviewCount: number;
}

export interface AdditionalProperty {
  name: string;
  value: string;
}

export interface Metadata {
  probability: number;
  dateDownloaded: string; // ISO date string
}

export enum ScrapType {
  PRODUCT = "product",
}
