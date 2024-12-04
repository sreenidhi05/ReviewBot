import React, { useState } from "react";

const LinkInput = () => {
  const [productLink, setProductLink] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleInputChange = (event) => {
    setProductLink(event.target.value);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (validateProductLink(productLink)) {
      console.log("Product Link Submitted:", productLink);
      setErrorMessage("");
      // Add your API call or processing logic here
    } else {
      setErrorMessage("Please enter a valid product link.");
    }
  };

  const validateProductLink = (link) => {
    const urlPattern = /^(https?:\/\/)?([\w\d\-_]+\.){1,2}[\w\d\-_]+\/?/;
    return urlPattern.test(link);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-gray-100 to-gray-200">
      <div className="w-full max-w-lg bg-white p-10 rounded-xl shadow-xl">
        <h1 className="text-3xl font-extrabold text-gray-800 mb-6 text-center">
          Get Analysis
        </h1>
        <p className="text-gray-600 text-center mb-8">
          Enter your product link to analyze and fetch reviews.
        </p>
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <label
              htmlFor="productLink"
              className="block text-sm font-semibold text-gray-700"
            >
              Product Link
            </label>
            <input
              type="text"
              id="productLink"
              placeholder="https://example.com/product"
              value={productLink}
              onChange={handleInputChange}
              className="mt-2 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm px-4 py-2"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 text-white font-semibold py-3 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-400 focus:ring-opacity-50 transition duration-300"
          >
            Submit
          </button>
        </form>
        {errorMessage && (
          <p className="mt-6 text-red-500 text-center font-medium">
            {errorMessage}
          </p>
        )}
      </div>
    </div>
  );
};

export default LinkInput;
