import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

const ProductDescription = () => {
  const location = useLocation();
  const [summary, setSummary] = useState("Loading summary...");
  const [productDetails, setProductDetails] = useState(() => {
    return (
      location.state?.productDetails ||
      JSON.parse(localStorage.getItem("productDetails"))
    );
  });
  const reviews = location.state?.reviews || [];

  useEffect(() => {
    if (location.state?.productDetails) {
      localStorage.setItem(
        "productDetails",
        JSON.stringify(location.state.productDetails)
      );
    }
  }, [location.state]);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const response = await fetch("http://localhost:8000/process-reviews", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ reviews }),
        });

        if (response.ok) {
          const data = await response.json();
          setSummary(data.summary);
        } else {
          setSummary("Failed to summarize reviews.");
          console.error("Failed to summarize reviews");
        }
      } catch (error) {
        setSummary("Error summarizing reviews.");
        console.error("Error while fetching summary:", error);
      }
    };

    if (reviews.length > 0) {
      fetchSummary();
    } else {
      setSummary("No reviews available for summarization.");
    }
  }, [reviews]);

  if (!productDetails) {
    return <div className="text-center mt-10">No product details found!</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 p-6">
      {/* Main Product Description Container */}
      <div className="max-w-6xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="flex flex-col md:flex-row">
          {/* Product Image */}
          <div className="md:w-1/2 p-6 flex items-center justify-center bg-gray-50">
            <img
              src={productDetails.image || "https://via.placeholder.com/300"}
              alt="Product"
              className="w-full max-w-sm rounded-lg shadow-md object-cover"
            />
          </div>
          {/* Product Details */}
          <div className="md:w-1/2 p-8">
            <h1 className="text-2xl font-bold text-gray-800 mb-4">
              {productDetails.name || "Product Name"}
            </h1>
            <p className="text-xl text-gray-600 mb-4">
              <span className="font-bold">Price: </span>
              {productDetails.price || "N/A"}
            </p>
            <p className="text-lg text-gray-600 mb-6">
              <span className="font-semibold">Rating: </span>
              {productDetails.rating || "N/A"}
            </p>
            <p className="text-gray-700 text-md leading-relaxed">
              {productDetails.description ||
                "No additional description available for this product."}
            </p>
          </div>
        </div>
      </div>

      {/* Additional Insights Section */}
      <div className="max-w-6xl mx-auto mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Summarization Card */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Summarization Output
          </h2>
          <p className="text-gray-700">{summary}</p>
        </div>

        {/* Sentiment Analysis Card */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Sentiment Analysis
          </h2>
          <p className="text-gray-700">
            {productDetails.sentiment ||
              "Sentiment analysis results will be displayed here."}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ProductDescription;










// import React, { useEffect, useState } from "react";
// import { useLocation } from "react-router-dom";

// const ProductDescription = () => {
//   const location = useLocation();
//   const [summary, setSummary] = useState("Loading summary...");
//   const [productDetails, setProductDetails] = useState(() => {
//     return (
//       location.state?.productDetails ||
//       JSON.parse(localStorage.getItem("productDetails"))
//     );
//   });
//   const reviews = location.state?.reviews || [];
//   useEffect(() => {
//     if (location.state?.productDetails) {
//       localStorage.setItem(
//         "productDetails",
//         JSON.stringify(location.state.productDetails)
//       );
//     }
//   }, [location.state]);


//   useEffect(() => {
//     const fetchSummary = async () => {
//       try {
//         const response = await fetch("http://localhost:8000/process-reviews", {
//           method: "POST",
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify({ reviews }),
//         });

//         if (response.ok) {
//           const data = await response.json();
//           setSummary(data.summary);
//         } else {
//           setSummary("Failed to summarize reviews.");
//           console.error("Failed to summarize reviews");
//         }
//       } catch (error) {
//         setSummary("Error summarizing reviews.");
//         console.error("Error while fetching summary:", error);
//       }
//     };

//     if (reviews.length > 0) {
//       fetchSummary();
//     } else {
//       setSummary("No reviews available for summarization.");
//     }
//   }, [reviews]);




//   if (!productDetails) {
//     return <div className="text-center mt-10">No product details found!</div>;
//   }

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 p-6">
//       {/* Main Product Description Container */}
//       <div className="max-w-6xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
//         <div className="flex flex-col md:flex-row">
//           {/* Product Image */}
//           <div className="md:w-1/2 p-6 flex items-center justify-center bg-gray-50">
//             <img
//               src={productDetails.image || "https://via.placeholder.com/300"}
//               alt="Product"
//               className="w-full max-w-sm rounded-lg shadow-md object-cover"
//             />
//           </div>
//           {/* Product Details */}
//           <div className="md:w-1/2 p-8">
//             <h1 className="text-2xl font-bold text-gray-800 mb-4">
//               {productDetails.name || "Product Name"}
//             </h1>
//             <p className="text-xl text-gray-600 mb-4">
//               <span className="font-bold">Price: </span>
//               {productDetails.price || "N/A"}
//             </p>
//             <p className="text-lg text-gray-600 mb-6">
//               <span className="font-semibold">Rating: </span>
//               {productDetails.rating || "N/A"}
//             </p>
//             <p className="text-gray-700 text-md leading-relaxed">
//               {productDetails.description ||
//                 "No additional description available for this product."}
//             </p>
//           </div>
//         </div>
//       </div>

//       {/* Additional Insights Section */}
//       <div className="max-w-6xl mx-auto mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
//         {/* Summarization Card */}
//         <div className="bg-white p-6 rounded-lg shadow-md">
//           <h2 className="text-2xl font-bold text-gray-800 mb-4">
//             Summarization Output
//           </h2>
//           <p className="text-gray-700">
//             {productDetails.summary ||
//               "Summarization details for this product will appear here."}
//           </p>
//         </div>

//         {/* Sentiment Analysis Card */}
//         <div className="bg-white p-6 rounded-lg shadow-md">
//           <h2 className="text-2xl font-bold text-gray-800 mb-4">
//             Sentiment Analysis
//           </h2>
//           <p className="text-gray-700">
//             {productDetails.sentiment ||
//               "Sentiment analysis results will be displayed here."}
//           </p>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default ProductDescription;






