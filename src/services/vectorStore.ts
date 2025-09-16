import { ProductInterface } from "@/types/zyte.types";
import { Pinecone } from "@pinecone-database/pinecone";
import { ScrapedContent } from "@prisma/client";
import OpenAI from "openai";
import crypto from "crypto";

export const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY!,
});

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

const logger = {
  info: (message: string, data?: any) => {
    console.log(
      `[INFO] ${new Date().toISOString()} - ${message}`,
      data ? JSON.stringify(data, null, 2) : ""
    );
  },
  error: (message: string, error?: any) => {
    console.error(
      `[ERROR] ${new Date().toISOString()} - ${message}`,
      error instanceof Error ? error.stack : error
    );
  },
  warn: (message: string, data?: any) => {
    console.warn(
      `[WARN] ${new Date().toISOString()} - ${message}`,
      data ? JSON.stringify(data, null, 2) : ""
    );
  },
  debug: (message: string, data?: any) => {
    if (process.env.NODE_ENV === "development") {
      console.debug(
        `[DEBUG] ${new Date().toISOString()} - ${message}`,
        data ? JSON.stringify(data, null, 2) : ""
      );
    }
  },
};

const EMBEDDING_CONFIG = {
  model: "text-embedding-3-small",
  dimensions: 1536,
  batchSize: 20,
  maxRetries: 3,
  retryDelay: 1000,
};

const CHUNKING_CONFIG = {
  maxTokens: 512,
  overlapTokens: 50,
  minChunkSize: 100,
  maxChunks: 500,
};

const PINECONE_CONFIG = {
  batchSize: 100,
  namespace: process.env.PINECONE_NAMESPACE || "default",
  maxMetadataSize: 40960,
};

interface ChunkMetadata {
  url?: string;
  name?: string;
  contentId: string;
  chunkIndex: number;
  totalChunks: number;
  description?: string;
  price?: string;
  text: string;
  textSnippet: string;
  contentType: string;
  timestamp: string;
  checksum: string;
  mainImage?: string;
}

class TokenEstimator {
  static estimate(text: string): number {
    return Math.ceil(text.length / 4);
  }
}

class TextChunker {
  static chunk(text: string): string[] {
    logger.debug("Starting text chunking", { textLength: text.length });

    if (!text || text.trim().length < CHUNKING_CONFIG.minChunkSize) {
      logger.warn("Text too short for chunking", {
        textLength: text.length,
        minSize: CHUNKING_CONFIG.minChunkSize,
      });
      return [];
    }

    const tokens = TokenEstimator.estimate(text);
    if (tokens <= CHUNKING_CONFIG.maxTokens) {
      logger.debug("Text fits in single chunk", { tokens });
      return [text.trim()];
    }

    const chunks: string[] = [];
    const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
    let currentChunk = "";
    let currentTokens = 0;

    logger.debug("Processing sentences", {
      sentenceCount: sentences.length,
      estimatedTokens: tokens,
    });

    for (const sentence of sentences) {
      const sentenceTokens = TokenEstimator.estimate(sentence);

      if (currentTokens + sentenceTokens > CHUNKING_CONFIG.maxTokens) {
        if (currentChunk.trim().length >= CHUNKING_CONFIG.minChunkSize) {
          chunks.push(currentChunk.trim());
          logger.debug("Added chunk", {
            chunkIndex: chunks.length - 1,
            chunkTokens: currentTokens,
          });
        }

        const overlap =
          chunks.length > 0
            ? currentChunk
                .split(" ")
                .slice(-Math.floor(CHUNKING_CONFIG.overlapTokens / 4))
                .join(" ")
            : "";
        currentChunk = overlap + " " + sentence;
        currentTokens = TokenEstimator.estimate(currentChunk);
      } else {
        currentChunk += " " + sentence;
        currentTokens += sentenceTokens;
      }

      if (chunks.length >= CHUNKING_CONFIG.maxChunks) {
        logger.warn("Reached maximum chunk limit", {
          maxChunks: CHUNKING_CONFIG.maxChunks,
        });
        break;
      }
    }

    if (currentChunk.trim().length >= CHUNKING_CONFIG.minChunkSize) {
      chunks.push(currentChunk.trim());
    }

    const finalChunks = chunks.slice(0, CHUNKING_CONFIG.maxChunks);
    logger.info("Text chunking completed", {
      totalChunks: finalChunks.length,
      originalTokens: tokens,
    });

    return finalChunks;
  }
}

class EmbeddingGenerator {
  static async generate(texts: string[]): Promise<number[][]> {
    logger.info("Starting embedding generation", { textCount: texts.length });

    const embeddings: number[][] = [];
    const batches = this.createBatches(texts);

    logger.debug("Created batches", {
      batchCount: batches.length,
      batchSize: EMBEDDING_CONFIG.batchSize,
    });

    for (let i = 0; i < batches.length; i++) {
      const batch = batches[i];
      let retries = 0;
      let success = false;

      logger.debug("Processing batch", {
        batchIndex: i,
        batchSize: batch.length,
      });

      while (retries < EMBEDDING_CONFIG.maxRetries && !success) {
        try {
          const response = await openai.embeddings.create({
            model: EMBEDDING_CONFIG.model,
            dimensions: EMBEDDING_CONFIG.dimensions,
            input: batch,
          });

          embeddings.push(...response.data.map((d) => d.embedding));
          success = true;
          logger.debug("Batch processed successfully", {
            batchIndex: i,
            embeddingCount: response.data.length,
          });

          if (i < batches.length - 1) {
            await this.rateLimitDelay();
          }
        } catch (error) {
          retries++;
          logger.warn("Embedding generation retry", {
            batchIndex: i,
            retryCount: retries,
            error: error instanceof Error ? error.message : error,
          });

          if (retries >= EMBEDDING_CONFIG.maxRetries) {
            logger.error("Embedding generation failed after max retries", {
              batchIndex: i,
              maxRetries: EMBEDDING_CONFIG.maxRetries,
            });
            throw new Error(
              `Embedding generation failed after ${EMBEDDING_CONFIG.maxRetries} retries`
            );
          }
          await this.exponentialBackoff(retries);
        }
      }
    }

    logger.info("Embedding generation completed", {
      totalEmbeddings: embeddings.length,
    });
    return embeddings;
  }

  private static createBatches(texts: string[]): string[][] {
    const batches: string[][] = [];
    for (let i = 0; i < texts.length; i += EMBEDDING_CONFIG.batchSize) {
      batches.push(texts.slice(i, i + EMBEDDING_CONFIG.batchSize));
    }
    return batches;
  }

  private static async rateLimitDelay(): Promise<void> {
    logger.debug("Applying rate limit delay", { delayMs: 200 });
    await new Promise((resolve) => setTimeout(resolve, 200));
  }

  private static async exponentialBackoff(retryCount: number): Promise<void> {
    const delay = EMBEDDING_CONFIG.retryDelay * Math.pow(2, retryCount - 1);
    logger.debug("Applying exponential backoff", {
      retryCount,
      delayMs: delay,
    });
    await new Promise((resolve) => setTimeout(resolve, delay));
  }
}

class ContentProcessor {
  static prepareTextContent(data: ScrapedContent): string {
    logger.debug("Preparing text content for processing", {
      hasName: !!data.name,
      hasDescription: !!data.description,
      hasPrice: !!data.price,
      hasUrl: !!data.url,
    });

    const sections: string[] = [];

    if (data.name) {
      sections.push(`Name: ${data.name}`);
      logger.debug("Added name section");
    }

    if (data.description) {
      sections.push(`Description: ${data.description}`);
      logger.debug("Added description section");
    }

    if (data.price) {
      sections.push(`Price: ${data.price}`);
      logger.debug("Added price section");
    }

    if (data.url) {
      sections.push(`URL: ${data.url}`);
      logger.debug("Added URL section");
    }

    const finalContent = sections.filter((s) => s && s.trim()).join("\n\n");
    logger.info("Text content prepared", {
      sectionCount: sections.length,
      finalLength: finalContent.length,
    });

    return finalContent;
  }
}

export class VectorStore {
  private pinecone: Pinecone;
  private openai: OpenAI;
  private index: any;
  public data: ScrapedContent | null;

  constructor() {
    this.pinecone = pinecone;
    this.openai = openai;
    this.data = null;
    this.index = null;
  }

  async setup() {
    this.index = this.pinecone.Index(
      process.env.PINECONE_INDEX_NAME || "web-scraper-index-three"
    );
    logger.debug("VectorStore initialized", {
      indexName: process.env.PINECONE_INDEX_NAME,
    });
  }

  async upsertData(): Promise<number> {
    if (!this.data || !this.index) {
      throw new Error("Data or index not initialized");
    }

    logger.info("Starting vector upsert", { dataId: this.data.id });

    try {
      const textContent = ContentProcessor.prepareTextContent(this.data);
      const chunks = TextChunker.chunk(textContent);

      if (chunks.length === 0) {
        logger.warn("No indexable content found", { dataId: this.data.id });
        return 0;
      }

      const embeddings = await EmbeddingGenerator.generate(chunks);
      const vectorCount = await this.upsert(chunks, embeddings);

      logger.info("Vector upsert completed", {
        dataId: this.data.id,
        vectorCount,
      });
      return vectorCount;
    } catch (error) {
      logger.error("Error upserting data", { dataId: this.data.id, error });
      throw error;
    }
  }

  private async upsert(
    chunks: string[],
    embeddings: number[][]
  ): Promise<number> {
    const contentId = this.generateContentId();
    const vectors = this.prepareVectors(contentId, chunks, embeddings);

    logger.debug("Prepared vectors", {
      vectorCount: vectors.length,
      contentId,
    });

    await this.batchUpsert(vectors);
    return vectors.length;
  }

  private generateContentId(): string {
    const source = this.data?.url || this.data?.id || crypto.randomUUID();
    const contentId = crypto
      .createHash("sha256")
      .update(source)
      .digest("hex")
      .substring(0, 16);
    logger.debug("Generated content ID", { source, contentId });
    return contentId;
  }

  private prepareVectors(
    contentId: string,
    chunks: string[],
    embeddings: number[][]
  ): any[] {
    logger.debug("Preparing vectors", {
      chunkCount: chunks.length,
      embeddingCount: embeddings.length,
    });

    return chunks.map((chunk, i) => {
      const metadata: ChunkMetadata = {
        url: this.data?.url,
        name: this.data?.name?.substring(0, 256),
        contentId,
        chunkIndex: i,
        totalChunks: chunks.length,
        description: this.data?.description?.substring(0, 512),
        price: this.data?.price,
        text: chunk,
        textSnippet: chunk.substring(0, 1000),
        contentType: "product_info",
        timestamp: new Date().toISOString(),
        checksum: crypto.createHash("md5").update(chunk).digest("hex"),
        mainImage: this.data?.mainImage,
      };

      const sanitizedMetadata = this.sanitizeMetadata(metadata);
      logger.debug("Prepared vector metadata", {
        chunkIndex: i,
        metadataSize: JSON.stringify(sanitizedMetadata).length,
      });

      return {
        id: `${contentId}_${i}`,
        values: embeddings[i],
        metadata: sanitizedMetadata,
      };
    });
  }

  private sanitizeMetadata(metadata: any): any {
    const metadataStr = JSON.stringify(metadata);
    if (metadataStr.length > PINECONE_CONFIG.maxMetadataSize) {
      logger.warn("Metadata too large, sanitizing", {
        originalSize: metadataStr.length,
        maxSize: PINECONE_CONFIG.maxMetadataSize,
      });

      const { text, textSnippet, description, ...essentialMetadata } = metadata;
      const sanitized = {
        ...essentialMetadata,
        text: text?.substring(0, 1000),
        textSnippet: textSnippet?.substring(0, 500),
        description: description?.substring(0, 200),
      };

      logger.debug("Metadata sanitized", {
        newSize: JSON.stringify(sanitized).length,
      });
      return sanitized;
    }
    return metadata;
  }

  private async batchUpsert(vectors: any[]): Promise<void> {
    logger.debug("Starting batch upsert", {
      totalVectors: vectors.length,
      batchSize: PINECONE_CONFIG.batchSize,
    });

    const batches = [];
    for (let i = 0; i < vectors.length; i += PINECONE_CONFIG.batchSize) {
      batches.push(vectors.slice(i, i + PINECONE_CONFIG.batchSize));
    }

    logger.debug("Created upsert batches", { batchCount: batches.length });

    for (let i = 0; i < batches.length; i++) {
      const batch = batches[i];
      logger.debug("Upserting batch", {
        batchIndex: i,
        batchSize: batch.length,
      });

      await this.index.namespace(PINECONE_CONFIG.namespace).upsert(batch);
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    logger.info("Batch upsert completed", { totalBatches: batches.length });
  }

  async checkDuplicate(): Promise<boolean> {
    if (!this.data || !this.index) {
      throw new Error("Data or index not initialized");
    }

    logger.debug("Checking for duplicate content", { dataId: this.data.id });

    const contentId = this.generateContentId();

    try {
      const results = await this.index
        .namespace(PINECONE_CONFIG.namespace)
        .query({
          id: `${contentId}_0`,
          topK: 1,
          includeValues: false,
          includeMetadata: false,
        });

      const isDuplicate = results.matches && results.matches.length > 0;
      logger.debug("Duplicate check result", {
        dataId: this.data.id,
        contentId,
        isDuplicate,
      });

      return isDuplicate;
    } catch (error) {
      logger.error("Error checking for duplicate", {
        dataId: this.data.id,
        error,
      });
      return false;
    }
  }

  async similaritySearch(query: string, topK: number = 10): Promise<any> {
    if (!this.index) {
      throw new Error("Index not initialized");
    }

    const response = await this.openai.embeddings.create({
      model: EMBEDDING_CONFIG.model,
      input: query,
      dimensions: EMBEDDING_CONFIG.dimensions,
    });

    const queryEmbedding = response.data[0].embedding;

    const searchResponse = await this.index
      .namespace(PINECONE_CONFIG.namespace)
      .query({
        vector: queryEmbedding,
        topK,
        includeMetadata: true,
      });

    return searchResponse;
  }

  async deleteDocument(documentId: string): Promise<void> {
    if (!this.index) {
      throw new Error("Index not initialized");
    }

    await this.index.namespace(PINECONE_CONFIG.namespace).deleteMany({
      filter: {
        contentId: { $eq: documentId },
      },
    });
  }
}
