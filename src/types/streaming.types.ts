/**
 * Streaming Types
 * 
 * Type definitions for Server-Sent Events (SSE) streaming implementation.
 * These types define the structure of events sent from backend to frontend
 * during curriculum generation.
 */

/**
 * Stream Event Types
 * Different types of events sent during the streaming process
 */
export enum StreamEventType {
  /** Progress update with status message */
  PROGRESS = 'progress',
  /** Text chunk from AI generation */
  CHUNK = 'chunk',
  /** Final complete curriculum */
  COMPLETE = 'complete',
  /** Error occurred during processing */
  ERROR = 'error',
  /** Keep-alive ping to maintain connection */
  PING = 'ping',
}

/**
 * Progress Status
 * Indicates current stage of curriculum generation
 */
export enum ProgressStatus {
  /** Starting the generation process */
  STARTED = 'started',
  /** Parsing PDF file */
  PARSING_PDF = 'parsing_pdf',
  /** PDF parsing complete */
  PDF_PARSED = 'pdf_parsed',
  /** Sending content to AI */
  GENERATING_CURRICULUM = 'generating_curriculum',
  /** AI is generating content */
  AI_PROCESSING = 'ai_processing',
  /** Parsing AI response */
  PARSING_RESPONSE = 'parsing_response',
  /** Generation complete */
  COMPLETED = 'completed',
}

/**
 * Base Stream Event
 * All SSE events follow this structure
 */
export interface StreamEvent {
  /** Type of event */
  type: StreamEventType;
  /** Event payload data */
  data: unknown;
  /** Timestamp when event was created */
  timestamp: string;
}

/**
 * Progress Event
 * Sent to update user on current processing stage
 */
export interface ProgressEvent extends StreamEvent {
  type: StreamEventType.PROGRESS;
  data: {
    /** Current status */
    status: ProgressStatus;
    /** Human-readable message */
    message: string;
    /** Optional metadata (e.g., pages parsed, chunks received) */
    metadata?: Record<string, unknown>;
  };
}

/**
 * Chunk Event
 * Sent when AI generates a chunk of text
 */
export interface ChunkEvent extends StreamEvent {
  type: StreamEventType.CHUNK;
  data: {
    /** Text chunk from AI */
    chunk: string;
    /** Total chunks received so far */
    chunkIndex: number;
  };
}

/**
 * Complete Event
 * Sent when curriculum generation is complete
 */
export interface CompleteEvent extends StreamEvent {
  type: StreamEventType.COMPLETE;
  data: {
    /** Generated curriculum */
    curriculum: unknown; // Will be typed as Curriculum when imported
    /** AI provider used */
    aiProvider: string;
    /** Total processing time in milliseconds */
    processingTime: number;
  };
}

/**
 * Error Event
 * Sent when an error occurs during processing
 */
export interface ErrorEvent extends StreamEvent {
  type: StreamEventType.ERROR;
  data: {
    /** Error code */
    code: string;
    /** Error message */
    message: string;
    /** Optional error details */
    details?: unknown;
  };
}

/**
 * Ping Event
 * Keep-alive event to prevent connection timeout
 */
export interface PingEvent extends StreamEvent {
  type: StreamEventType.PING;
  data: {
    /** Server timestamp */
    timestamp: string;
  };
}

/**
 * Union type of all possible stream events
 */
export type StreamEventUnion =
  | ProgressEvent
  | ChunkEvent
  | CompleteEvent
  | ErrorEvent
  | PingEvent;

/**
 * Helper function to create SSE formatted message
 * @param event - Stream event to format
 * @returns SSE formatted string
 */
export function formatSSEMessage(event: StreamEvent): string {
  return `event: ${event.type}\ndata: ${JSON.stringify(event.data)}\n\n`;
}

/**
 * Helper function to create progress event
 */
export function createProgressEvent(
  status: ProgressStatus,
  message: string,
  metadata?: Record<string, unknown>
): ProgressEvent {
  return {
    type: StreamEventType.PROGRESS,
    data: { status, message, metadata },
    timestamp: new Date().toISOString(),
  };
}

/**
 * Helper function to create chunk event
 */
export function createChunkEvent(chunk: string, chunkIndex: number): ChunkEvent {
  return {
    type: StreamEventType.CHUNK,
    data: { chunk, chunkIndex },
    timestamp: new Date().toISOString(),
  };
}

/**
 * Helper function to create complete event
 */
export function createCompleteEvent(
  curriculum: unknown,
  aiProvider: string,
  processingTime: number
): CompleteEvent {
  return {
    type: StreamEventType.COMPLETE,
    data: { curriculum, aiProvider, processingTime },
    timestamp: new Date().toISOString(),
  };
}

/**
 * Helper function to create error event
 */
export function createErrorEvent(
  code: string,
  message: string,
  details?: unknown
): ErrorEvent {
  return {
    type: StreamEventType.ERROR,
    data: { code, message, details },
    timestamp: new Date().toISOString(),
  };
}

/**
 * Helper function to create ping event
 */
export function createPingEvent(): PingEvent {
  return {
    type: StreamEventType.PING,
    data: { timestamp: new Date().toISOString() },
    timestamp: new Date().toISOString(),
  };
}
