import { FieldError } from "@/components/ui/field";

type FieldMessageProps = {
  id: string;
  error?: string;
};

export function FieldMessage(props: FieldMessageProps) {
  const { id, error } = props;
  return error ? <FieldError id={id}>{error}</FieldError> : null;
}
