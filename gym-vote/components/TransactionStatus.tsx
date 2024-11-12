import { TransactionState } from "@/interfaces/types";

interface TransactionStatusProps {
    txState: TransactionState;
}

export const TransactionStatus = ({ txState }: TransactionStatusProps) => {
    return (
        txState.error ? (
            <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-lg text-center">
                {txState.error}
            </div>
        ) : (
            <div className="mt-4 text-center">
                {txState.isProcessing && (
                    <p>{`Processing step ${txState.step}...`}</p>
                )}
            </div>
        )
    );
};