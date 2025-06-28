export async function HandleNotFound(c: any) {
  return c.json({
    errorCode: "errors.com.core.common.not_found",
    errorMessage: "",
  });
}
