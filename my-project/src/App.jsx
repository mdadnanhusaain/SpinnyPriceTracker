import { useState, useEffect } from "react";
import { buildSpinnyUrl, fetchSpinnyCars } from "./apiCall";
import { filterData, trimCarDataArray, sortData } from "./utils";
import { FaCopy, FaArrowUp, FaArrowDown } from "react-icons/fa";
import { LuLoaderCircle } from "react-icons/lu";
import "./App.css";

function App() {
  const initialSort = { field: "year", order: "desc" };

  const [isFetching, setIsFetching] = useState(false);
  const [apiResult, setApiResult] = useState(null);
  const [filterResult, setFilterResult] = useState(null);
  const [copiedIdx, setCopiedIdx] = useState(null);
  const [copiedField, setCopiedField] = useState(null);
  const [sortConfig, setSortConfig] = useState(initialSort);
  const [status200, setStatus200] = useState(true);
  const [showScrollTop, setShowScrollTop] = useState(false);

  const notify = (text, idx, field) => {
    setCopiedIdx(idx);
    setCopiedField(field);
    navigator.clipboard.writeText(text);
    setTimeout(() => {
      setCopiedIdx(null);
      setCopiedField(null);
    }, 2000);
  };

  const tableHeaders = [
    "Make",
    "Model",
    "Variant",
    "Fuel Type",
    "Transmission",
    "Year",
    "Owners",
    "Mileage",
    "Rounded Mileage",
    "Price",
    "Final Price",
    "URL",
    "City",
    "Color",
    "Body Type",
    "RTO",
    "ID",
  ];

  // Main form state (for API call)
  const [form, setForm] = useState({
    model: "",
    fuel_type: "",
  });

  const initialFilterForm = {
    variant: "",
    transmission: "",
    no_of_owners: "",
    make_year: "",
    make_year_range: "",
    mileage: "",
    mileage_range: "",
  };

  // Filter form state
  const [filterForm, setFilterForm] = useState(initialFilterForm);

  // Handle main form input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // Handle filter form input change
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilterForm((prev) => {
      const updated = { ...prev, [name]: value };
      handleFilterData(updated); // filter instantly
      return updated;
    });
  };

  // Fetch data from Spinny API
  const handleSpinnyApiCall = async () => {
    if (!form.model || !form.fuel_type) {
      alert("Model and Fuel Type are required!");
      return;
    }

    const result = await fetchSpinnyCars(
      {
        model: form.model.replace(" ", "-"),
        fuel_type: form.fuel_type.replaceAll(" ", ","),
      },
      setStatus200,
      setIsFetching
    );

    const trimmedResults = trimCarDataArray(result);

    // Apply default sorting (year desc)
    const sortedResults = sortData(
      trimmedResults,
      initialSort.field,
      initialSort.order
    );

    setApiResult(result);
    setFilterResult(sortedResults);
    setSortConfig(initialSort);
  };

  // Filter handler
  const handleFilterData = (updatedFilterForm = filterForm) => {
    if (!apiResult) return;
    const newFilteredResult = filterData(updatedFilterForm, apiResult);
    const trimmedResults = trimCarDataArray(newFilteredResult);

    setFilterResult(trimmedResults);
  };

  // Scroll to top handler
  const handleScrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Show scroll-to-top button only when scrolled more than one viewport height
  useEffect(() => {
    const onScroll = () => {
      const scrolled = window.scrollY || document.documentElement.scrollTop;
      setShowScrollTop(scrolled > window.innerHeight);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    // initialize state on mount
    onScroll();

    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Handle header click
  const handleSort = (field) => {
    // Determine next order
    const nextOrder =
      sortConfig.field === field && sortConfig.order === "asc" ? "desc" : "asc";

    // Update sort config
    setSortConfig({ field, order: nextOrder });

    // Apply sorting on the current filtered data
    const sorted = sortData(filterResult, field, nextOrder);
    setFilterResult(sorted);
  };

  const handleRedirect = () => {
    const url = buildSpinnyUrl({
      model: form.model.replace(" ", "-"),
      fuel_type: form.fuel_type.replaceAll(" ", ","),
    });
    window.open(url, "_blank");
  };

  return (
    <>
      <h1>Spinny Car Sorter</h1>

      {/* API Form */}
      <div className="card">
        <form
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "0.5em",
            marginBottom: "1em",
          }}
          onSubmit={(e) => {
            e.preventDefault();
            setFilterForm(initialFilterForm);
            handleSpinnyApiCall();
          }}
        >
          <input
            name="model"
            value={form.model}
            onChange={handleChange}
            placeholder="Model (required)"
            required
          />
          <input
            name="fuel_type"
            value={form.fuel_type}
            onChange={handleChange}
            placeholder="Fuel Type (required)"
            required
          />
          <button
            type="submit"
            style={{ marginTop: "1em" }}
            disabled={isFetching}
            className="flex justify-center items-center gap-4"
          >
            {isFetching && (
              <LuLoaderCircle className="animate-spin text-3xl" />
            )}{" "}
            Call Spinny API
          </button>
        </form>

        {!status200 && (
          <button
            type="submit"
            style={{ marginTop: "1em" }}
            onClick={handleRedirect}
          >
            Redirect website
          </button>
        )}

        {/* Filter Form */}
        <form
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "0.5em",
            marginBottom: "1em",
          }}
        >
          <input
            name="variant"
            value={filterForm.variant}
            onChange={handleFilterChange}
            placeholder="Variant"
          />
          <input
            name="transmission"
            value={filterForm.transmission}
            onChange={handleFilterChange}
            placeholder="Transmission Type"
          />
          <input
            name="no_of_owners"
            value={filterForm.no_of_owners}
            onChange={handleFilterChange}
            placeholder="Owner Number"
          />
          <div className="grid grid-cols-3">
            <input
              name="make_year"
              value={filterForm.make_year}
              type="number"
              onChange={handleFilterChange}
              placeholder="Year"
              className="col-span-2"
            />
            <input
              name="make_year_range"
              value={filterForm.make_year_range}
              type="number"
              onChange={handleFilterChange}
              placeholder="Year Range"
              className="col-span-1"
            />
          </div>
          <div className="grid grid-cols-3">
            <input
              name="mileage"
              value={filterForm.mileage}
              type="number"
              onChange={handleFilterChange}
              placeholder="mileage"
              className="col-span-2"
            />
            <input
              name="mileage_range"
              value={filterForm.mileage_range}
              type="number"
              onChange={handleFilterChange}
              placeholder="mileage Range"
              className="col-span-1"
            />
          </div>
        </form>

        {!!filterResult?.length && (
          <div>Total Results: {filterResult.length}</div>
        )}

        {filterResult && filterResult.length > 0 ? (
          <div className="overflow-x-auto mt-4">
            <table className="min-w-max w-full border border-gray-600 divide-y divide-gray-600">
              <thead className="bg-gray-900 sticky top-0 z-10">
                <tr>
                  {tableHeaders.map((col) => {
                    // Map visible header text to sort field
                    const sortKeyMap = {
                      "Fuel Type": "fuel",
                      Transmission: "transmission",
                      Year: "year",
                      Owners: "owner",
                    };

                    const sortKey = sortKeyMap[col];
                    const isSorted = sortConfig.field === sortKey;

                    return (
                      <th
                        key={col}
                        className={`${
                          col === "Variant" ? "px-2" : "px-4"
                        } py-2 text-left text-sm font-bold ${
                          sortKey
                            ? "cursor-pointer text-blue-300 hover:text-blue-400"
                            : "text-gray-300"
                        }`}
                        onClick={() => sortKey && handleSort(sortKey)}
                      >
                        <div className="flex items-center gap-1">
                          {col}
                          {isSorted &&
                            (sortConfig.order === "asc" ? (
                              <FaArrowUp className="inline" />
                            ) : (
                              <FaArrowDown className="inline" />
                            ))}
                        </div>
                      </th>
                    );
                  })}
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-600">
                {filterResult.map((car, idx) => (
                  <tr
                    key={car.id}
                    className={`${
                      idx % 2 === 0 ? "bg-gray-800" : "bg-gray-700"
                    } hover:bg-gray-600`}
                  >
                    <td className="px-4 py-2 text-left text-sm text-gray-200">
                      {car.make}
                    </td>
                    <td className="px-4 py-2 text-left text-sm text-gray-200">
                      {car.model}
                    </td>
                    <td className="px-2 py-2 text-left text-sm text-gray-200 w-[10rem] wrap-break-word">
                      {car.variant}
                    </td>
                    <td className="px-4 py-2 text-left text-sm text-gray-200">
                      {car.fuel_type}
                    </td>
                    <td className="px-4 py-2 text-left text-sm text-gray-200">
                      {car.transmission}
                    </td>
                    <td className="px-4 py-2 text-left text-sm text-gray-200">
                      {car.make_year}
                    </td>
                    <td className="px-4 py-2 text-left text-sm text-gray-200">
                      {car.no_of_owners}
                    </td>
                    <td className="px-4 py-2 text-left text-sm text-gray-200">
                      {car.mileage}
                    </td>
                    <td className="px-4 py-2 text-left text-sm text-gray-200">
                      {car.round_off_mileage_new}
                    </td>
                    <td className="px-4 py-2 text-left text-sm text-gray-200">
                      <div className="flex gap-4">
                        {car.price?.toLocaleString()}
                        <div
                          className="text-white cursor-pointer"
                          onClick={() => notify(car.price, idx, "initPrice")}
                        >
                          <FaCopy />
                        </div>
                        {copiedIdx === idx &&
                          copiedField === "initPrice" &&
                          "Copied"}
                      </div>
                    </td>
                    <td className="px-4 py-2 text-left text-sm text-gray-200">
                      <div className="flex gap-4">
                        {`${car.finalPrice?.toLocaleString()} ${
                          car.price === car.finalPrice ? "(No Discount)" : ""
                        }` ?? "-"}
                        <div
                          className="text-white cursor-pointer"
                          onClick={() =>
                            notify(car.finalPrice, idx, "finalPrice")
                          }
                        >
                          <FaCopy />
                        </div>
                        {copiedIdx === idx &&
                          copiedField === "finalPrice" &&
                          "Copied"}
                      </div>
                    </td>
                    <td className="px-4 py-2 text-left text-sm text-blue-400 underline">
                      <div className="flex gap-4">
                        <a
                          href={car.permanent_url}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Link
                        </a>
                        <div
                          className="text-white cursor-pointer"
                          onClick={() => notify(car.permanent_url, idx, "Link")}
                        >
                          <FaCopy />
                        </div>
                        {copiedIdx === idx &&
                          copiedField === "Link" &&
                          "Copied"}
                      </div>
                    </td>
                    <td className="px-4 py-2 text-left text-sm text-gray-200">
                      {car.city}
                    </td>
                    <td className="px-4 py-2 text-left text-sm text-gray-200">
                      {car.color}
                    </td>
                    <td className="px-4 py-2 text-left text-sm text-gray-200">
                      {car.body_type}
                    </td>
                    <td className="px-4 py-2 text-left text-sm text-gray-200">
                      {car.rto}
                    </td>
                    <td className="px-4 py-2 text-left text-sm text-gray-200">
                      {car.id}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          apiResult && (
            <div className="mt-2 text-gray-400">No results found</div>
          )
        )}

        {/* Scroll to Top Button (shown only after scrolling one viewport height) */}
        {showScrollTop && (
          <button
            onClick={handleScrollToTop}
            style={{
              position: "fixed",
              right: "2em",
              bottom: "2em",
              zIndex: 1000,
              padding: "0.8em 1.5em",
              background: "#646cff",
              color: "#fff",
              border: "none",
              borderRadius: "2em",
              fontWeight: "bold",
              boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
              cursor: "pointer",
            }}
          >
            Return to Top
          </button>
        )}
      </div>
    </>
  );
}

export default App;
