const spinnyUrl = "https://www.spinny.com";

export function filterData(filter, results) {
  console.log("Results, ", results);
  console.log("Filter, ", filter);

  if (!results || !Array.isArray(results)) return [];

  const filteredResults = results.filter((item) => {
    return Object.entries(filter).every(([key, value]) => {
      if (!value) return true; // Skip empty filters

      if (key === "make_year") {
        const year = Number(value);
        const range = Number(filter.make_year_range) || 0;
        return item.make_year >= year - range && item.make_year <= year + range;
      }

      if (key === "mileage") {
        const odo = Number(value);
        const range = Number(filter.mileage_range) || 0;
        return item.mileage >= odo - range && item.mileage <= odo + range;
      }

      if (key === "make_year_range" || key === "mileage_range") {
        return true; // Don't filter directly on range fields
      }

      // Default substring check for other fields
      const check = String(item[key])
        .toLowerCase()
        .includes(String(value).toLowerCase());
      return check;
    });
  });

  return filteredResults;
}

/**
 * Trims an array of car objects to include only essential fields.
 * @param {Array} cars - Array of car objects (raw API response)
 * @returns {Array} Array of cleaned-up car objects
 */
export function trimCarDataArray(cars) {
  if (!Array.isArray(cars)) return [];

  return cars.map((car) => ({
    id: car.id,
    make: car.make,
    model: car.model,
    variant: car.variant,
    mileage: car.mileage,
    round_off_mileage_new: car.round_off_mileage_new,
    make_year: car.make_year,
    price: car.price,
    permanent_url: spinnyUrl + car.permanent_url,
    city: car.city,
    fuel_type: car.fuel_type,
    no_of_owners: car.no_of_owners,
    color: car.color,
    body_type: car.body_type,
    rto: car.rto,
    transmission: car.transmission,
    finalPrice: car.discount?.final_discounted_price ?? car.price,
  }));
}

// src/sortData.js

/**
 * Sorts car results based on a field and order.
 * Secondary priority: always "make_year" in descending order,
 * unless sorting by year itself.
 *
 * @param {Array} results - Array of car objects.
 * @param {string} sort - Field to sort by: "fuel", "transmission", "owner", "year".
 * @param {string} order - "asc" or "desc".
 * @returns {Array} Sorted array.
 */
export function sortData(results, sort, order = "asc") {
  if (!Array.isArray(results) || results.length === 0) return [];

  // Map sort key to object properties
  const keyMap = {
    fuel: "fuel_type",
    transmission: "transmission",
    owner: "no_of_owners",
    year: "make_year",
  };

  const key = keyMap[sort];
  if (!key) return results;

  const sorted = [...results].sort((a, b) => {
    const valA = a[key];
    const valB = b[key];

    // --- Primary sort ---
    let primaryResult = 0;

    if (typeof valA === "string" && typeof valB === "string") {
      primaryResult = valA.localeCompare(valB);
    } else if (typeof valA === "number" && typeof valB === "number") {
      primaryResult = valA - valB;
    }

    // Apply order direction to primary sort
    if (order === "desc") primaryResult *= -1;

    // --- Secondary sort (by year desc) ---
    if (primaryResult === 0 && sort !== "year") {
      return b.make_year - a.make_year; // always descending by year
    }

    return primaryResult;
  });

  return sorted;
}
