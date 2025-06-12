export type Nullable<T> = T | null;
export type Optional<T> = T | undefined;

export interface BaseProps {
  className?: string;
  style?: React.CSSProperties;
}

export interface WithChildren {
  children: React.ReactNode;
}

export interface WithId {
  id: string;
}

export interface WithTimestamp {
  createdAt: Date;
  updatedAt: Date;
}

export type Status = 'idle' | 'loading' | 'success' | 'error';

export interface ApiResponse<T> {
  data: T;
  status: Status;
  error?: string;
} 