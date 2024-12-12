import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const LinkInput = () => {
  const [productLink, setProductLink] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleInputChange = (event) => {
    setProductLink(event.target.value);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (validateProductLink(productLink)) {
      setErrorMessage("");
      setLoading(true);

      const formData = new FormData();
      formData.append("url", productLink);

      try {
        const response = await fetch("http://127.0.0.1:5000/scrape", {
          method: "POST",
          body: formData,
        });

        if (response.ok) {
          const data = await response.json();
          console.log("API Response:", data); // Debugging log

          navigate("/productDescription", 
            { 
              state: 
              { productDetails: data.product_details, 
                reviews: data.reviews  
              } 
            });
        } 

        else 
        {
          setErrorMessage("Failed to fetch data. Please try again.");
        }
      } catch (error) {
        console.error("Error during API call:", error);
        setErrorMessage("An error occurred while fetching data.");
      } finally {
        setLoading(false);
      }
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
          Get Product Analysis
        </h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <input
            type="text"
            className="w-full p-3 border rounded-lg"
            placeholder="Enter product link"
            value={productLink}
            onChange={handleInputChange}
          />
          {errorMessage && <p className="text-red-500">{errorMessage}</p>}
          <button
            type="submit"
            className="w-full bg-blue-600 text-white p-3 rounded-lg font-bold"
            disabled={loading}
          >
            {loading ? "Processing..." : "Submit"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LinkInput;








// import React, { useState } from "react";
// import { useNavigate } from "react-router-dom";

// const LinkInput = () => {
//   const [productLink, setProductLink] = useState("");
//   const [errorMessage, setErrorMessage] = useState("");
//   const [loading, setLoading] = useState(false);

//   const navigate = useNavigate();

//   const handleInputChange = (event) => {
//     setProductLink(event.target.value);
//   };

//   const handleSubmit = async (event) => {
//     event.preventDefault();

//     if (validateProductLink(productLink)) {
//       setErrorMessage("");
//       setLoading(true);
      
//       const formData = new FormData();
//       formData.append("url", productLink);

//       try {
//         const response = await fetch("http://127.0.0.1:5000/scrape", {
//           method: "POST",
//           body: formData,
//         });

//         if (response.ok) {
//           const data = await response.json();
//           navigate("/productDescription", { state: { productDetails: data.product_details } });
//         } else {
//           setErrorMessage("Failed to fetch data. Please try again.");
//         }
//       } catch (error) {
//         console.error("Error during API call:", error);
//         setErrorMessage("An error occurred while fetching data.");
//       } finally {
//         setLoading(false);
//       }
//     } else {
//       setErrorMessage("Please enter a valid product link.");
//     }
//   };

//   const validateProductLink = (link) => {

//     const urlPattern = /^(https?:\/\/)?([\w\d\-_]+\.){1,2}[\w\d\-_]+\/?/;
//     return urlPattern.test(link);

//     // const flipkartPattern = /^(https?:\/\/)?(www\.)?flipkart\.com\/.+/;
//     // return flipkartPattern.test(link);    
//   };

//   return (
//     <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-gray-100 to-gray-200">
//       <div className="w-full max-w-lg bg-white p-10 rounded-xl shadow-xl">
//         <h1 className="text-3xl font-extrabold text-gray-800 mb-6 text-center">
//           Get Product Analysis
//         </h1>
//         <form onSubmit={handleSubmit} className="space-y-6">
//           <input
//             type="text"
//             className="w-full p-3 border rounded-lg"
//             placeholder="Enter product link"
//             value={productLink}
//             onChange={handleInputChange}
//           />
//           {errorMessage && <p className="text-red-500">{errorMessage}</p>}
//           <button
//             type="submit"
//             className="w-full bg-blue-600 text-white p-3 rounded-lg font-bold"
//             disabled={loading}
//           >
//             {loading ? "Processing..." : "Submit"}
//           </button>
//         </form>
//       </div>
//     </div>
//   );
// };

// export default LinkInput;
