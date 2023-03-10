export interface RedirectButtonProps {
    payButton: any;
    onSubmit(): void;
    amount?: {
        value: number;
    };
    name: string;
}
