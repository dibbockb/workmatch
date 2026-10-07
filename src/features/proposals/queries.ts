import { useMutation } from "@tanstack/react-query";
import { submitProposal } from "./api";

export function useSubmitProposal() {
    return useMutation({ mutationFn: submitProposal });
}