export type ActionState = {
  error?: string;
};

export const initialActionState: ActionState = {};

export function actionError(error: unknown, fallback = "Something went wrong. Please try again."): ActionState {
  if (
    typeof error === "object" &&
    error &&
    "digest" in error &&
    typeof (error as { digest?: unknown }).digest === "string" &&
    (error as { digest: string }).digest.startsWith("NEXT_REDIRECT")
  ) {
    throw error;
  }

  if (error instanceof Error) {
    return { error: error.message || fallback };
  }

  if (typeof error === "object" && error) {
    const maybeError = error as { message?: unknown; http_code?: unknown };
    if (maybeError.http_code === 403) {
      return { error: "The request was rejected by an external service. Please check the connected credentials and try again." };
    }
    if (typeof maybeError.message === "string") {
      return { error: maybeError.message };
    }
  }

  return { error: fallback };
}
