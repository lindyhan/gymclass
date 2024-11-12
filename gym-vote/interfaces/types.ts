export interface TransactionState {
    isProcessing: boolean;
    error: string | null;
    step: number;
}