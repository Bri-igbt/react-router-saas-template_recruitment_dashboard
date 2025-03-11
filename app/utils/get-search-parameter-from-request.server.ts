/**
 * Returns the value of a search parameter from a request.
 *
 * @param searchParameter - The search parameter to get the value of.
 * @returns The value of the search parameter.
 */
export function getSearchParameterFromRequest(searchParameter: string) {
  return function getSearchParameter(request: Request) {
    const url = new URL(request.url);
    const searchParameterValue = url.searchParams.get(searchParameter) ?? '';
    return searchParameterValue;
  };
}
