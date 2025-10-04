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
function buildSpinnyUrl(params = {}) {
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
  return `${BASE_URL}?${query}`;
}

/**
 * Fetches data from Spinny API and logs the result.
 * @param {Object} params - Optional query parameters.
 */
export async function fetchSpinnyCars(params = {}) {
  const url = buildSpinnyUrl(params);
  try {
    const response = await fetch(url);
    const data = await response.json();
    console.log("Spinny API Response:", data?.results);
    return data?.results;
  } catch (error) {
    console.error("Spinny API Error:", error);
    return null;
  }
}
