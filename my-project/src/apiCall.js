const proxyUrl = "https://cors-anywhere.herokuapp.com/";

const BASE_URL =
  import.meta.env.MODE === "production"
    ? proxyUrl + "https://api.spinny.com/v3/api/listing/v3/"
    : "/api";

console.log(import.meta.env.MODE);
console.log(BASE_URL);

/**
 * Builds the full API URL with optional query params.
 * @param {Object} params - Optional query parameters.
 * @returns {string} Full API URL
 */
export function buildSpinnyUrl(params = {}) {
  const defaultParams = {
    city: "delhi-ncr",
    product_type: "cars",
    fuel_type: "petrol",
    model: "venue",
    category: "used",
    size: "9999",
  };
  const merged = { ...defaultParams, ...params };
  const query = Object.entries(merged)
    .map(
      ([key, val]) => `${encodeURIComponent(key)}=${encodeURIComponent(val)}`
    )
    .join("&");

  const finalUrl = `${BASE_URL}?${query}`;
  console.log("URL:- ", finalUrl);
  return finalUrl;
}

/**
 * Fetches data from Spinny API and logs the result.
 * Automatically aborts if request exceeds the timeout.
 *
 * @param {Object} params - Optional query parameters.
 * @param {Function} setStatus200 - Sets response status flag.
 * @param {Function} setIsFetching - Toggles loading state.
 * @param {number} timeoutMs - Timeout in milliseconds (default: 8000).
 */
export async function fetchSpinnyCars(
  params = {},
  setStatus200,
  setIsFetching,
  timeoutMs = 8000
) {
  const url = buildSpinnyUrl(params);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    setIsFetching(true);
    // await new Promise((res) => setTimeout(res, 9000)); // 9s artificial delay

    const response = await fetch(url, { signal: controller.signal });

    clearTimeout(timeout);

    setStatus200(response.status === 200);
    console.log("Status:", response.status);

    const data = await response.json();
    return data?.results;
  } catch (error) {
    if (error.name === "AbortError") {
      console.error(`⏰ Fetch timed out after ${timeoutMs}ms`);
      setStatus200(false);
    } else {
      console.error("Spinny API Error:", error);
    }
    return null;
  } finally {
    setIsFetching(false);
  }
}
