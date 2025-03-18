"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { IoMdKey } from "react-icons/io";
import { MdOutlineFileCopy } from "react-icons/md";
import Cookies from "js-cookie";
import axios from "axios";
import { FaCrown } from "react-icons/fa";

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState({
    firstName: "",
    lastName: "",
    phoneNumber: "",
    email: "",
    city: "",
    state: "",
    postcode: "",
    country: "",
    executecodecount:null
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("account-settings")
  const [showEmail, setShowEmail] = useState(false)
  const [showToolTip, setShowToolTip] = useState(false)
  const [apiToken, setApiToken] = useState("")
  const [tokenLoading, setTokenLoading] = useState(false)
  const [tokenGenerationCount, setTokenGenerationCount] = useState(0)
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [apiTokenExists, setApiTokenExists] = useState(false);
  const [tokenCount, setTokenCount] = useState(0);
  const token  =  Cookies.get("token")

  useEffect(() => {
    const fetchstatus = async() => {
      try {
        
        const response =   await axios.get("http://localhost:3001/subscription/status",{
          headers:{
            Authorization:`Bearer ${token}`
          }
        });
        setIsSubscribed(response.data.isSubscribed)
        const tokenResponse =  await axios.get("http://localhost:3001/api-token/get",{
          headers:{
            Authorization:`Bearer ${token}`
          }
        })

        if(tokenResponse.data.token){
            setApiTokenExists(true)
            setTokenCount(1)
        }
        else{
          setApiTokenExists(false)
          setTokenCount(0)
        }
      } catch (error) {
        console.error("Failed to fetch status", error);

      }
    };

    fetchstatus();
  }, [])


  useEffect(() => {
    fetchProfile();
    const  storedcount =  Cookies.get("tokenGenerationCount")
    if(storedcount){
      setTokenGenerationCount(parseInt(storedcount,10))
    }
    fetchApitoken();

    
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await fetch("http://localhost:3001/user-profile/profile", {
        headers: {
          Authorization: `Bearer ${Cookies.get("token")}`,
        },
      });
      if (!res.ok) throw new Error("Failed to fetch profile");
      const data = await res.json();
      setProfile(data);
    } catch (err) {
      setError("Error fetching profile");
    }
  };

  const fetchApitoken= async() => {
    setTokenLoading(true)
    try {
      
      const res  =  await fetch("http://localhost:3001/api-token/get", {
          method:"GET",
          headers:{
            Authorization: `Bearer ${Cookies.get("token")}`,

          }
      })
      const data =  await  res.json()
      console.log("API Token Response:", data); // Debugging line

      if (data.token) {
        setApiToken(data.token); 
        setTokenGenerationCount(1)// Correctly set the token
      } else {
        setApiToken("");
        setTokenGenerationCount(0) // Set empty string if no token exists
      }
    } catch (error) {
      setError("Error fetching token");
      
    }
    setTokenLoading(false)
  }

  const updateProfile = async () => {
    setLoading(true);
    setError("");
    await new Promise ((resolve) =>  setTimeout(resolve,2000))
    try {
      const res = await fetch("http://localhost:3001/user-profile/update", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${Cookies.get("token")}`,
        },
        body: JSON.stringify(profile),
      });
      if (!res.ok) throw new Error("Failed to update profile");
      toast.success("profile updated successfully")
    } catch (err) {
      setError("Error updating profile");
    }
    setLoading(false);
  };

  const deleteProfile = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("http://localhost:3001/user-profile/delete", {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${Cookies.get("token")}`,
        },
      });
      if (!res.ok) throw new Error("Failed to delete profile");
      toast.success("Profile deleted!");
      router.push("/"); // Redirect after deletion
    } catch (err) {
      setError("Error deleting profile");
    }
    setLoading(false);
  };

  // generate api token 
  const generateApitoken = async()=>{
    if(!isSubscribed     && tokenCount >=2){
          toast.error("API generation limit reached ")
    }
    setTokenLoading(true)
    try {
       const response = await fetch("http://localhost:3001/api-token/generate" ,  {
        method:"POST",
        headers:{
          Authorization: `Bearer ${Cookies.get("token")}`,
        }
      });
      const data  = await  response.json()
      setApiToken(data.token)
      setApiTokenExists(true)
      setTokenCount((prev) => prev+1)
      toast.success("API Token Generated!");
    } catch (err) {
      setError("Error generating token");
    }
    setTokenLoading(false)
  }

    //delete api token  
    const deleteApitoken=async() => {
      setTokenLoading(true)
      try {
        
        const res =  await fetch("http://localhost:3001/api-token/delete", {
          method:"DELETE",
          headers:{
            Authorization: `Bearer ${Cookies.get("token")}`,

          }
        })
        if (!res.ok) throw new Error("Failed to delete token");

        setApiToken("")
        toast.success("API Token Deleted!");
        

      } catch (err) {
        setError("Error deleting token");
      }
      setTokenLoading(false)
    }




  return (
    <div className="h-screen bg-white flex">
      {/* Header */}


      <div className="w-[15rem] bg-blue-700 text-white p-4 h-screen flex-shrink-0">
        <h2 className="text-lg font-semibold mb-6">Your Profile</h2>
        <ul className="space-y-4">
          <li
            className={`cursor-pointer p-2 rounded ${
              activeTab === "account-settings" ? "bg-blue-500" : "hover:bg-blue-600"
            }`}
            onClick={() => setActiveTab("account-settings")}
          >
            Account Settings
          </li>
          <li
            className={`cursor-pointer p-2 rounded ${
              activeTab === "api-token" ? "bg-blue-500" : "hover:bg-blue-600"
            }`}
            onClick={() => setActiveTab("api-token")}
          >
            API Token
          </li>
        </ul>
      </div>
  
      <div className=" mx-auto mt-6  rounded p-6 flex flex-row gap-16 items-center justify-center ml-24">
        {/* Profile Info (Image + Name) */}
        <div className="flex flex-col items-center  w-[15rem] bg-white  p-6 rounded  border border-gray-200 h-[25rem]">
          <Image
            src="/code.jpeg"
            height={300}
            width={300}
            alt="User Avatar"
            className="w-24 h-24 rounded-full border"
          />
          <h2 className="text-sm font-semibold mt-3 text-black">
            {profile.firstName} {profile.lastName}
          </h2>
          <div className="relative w-full">
      <label className="text-sm font-medium text-gray-700 mb-2">Email *</label>
      <div className="flex items-center border  border-gray-300  rounded px-3 py-2 focus-within:ring-2 focus-within:ring-blue-500">
        <input
          type="text"
          value={showEmail ? profile.email : "••••••••••"}
          readOnly
          className="w-full bg-transparent outline-none text-black"
        />
        <button
          type="button"
          onClick={() => setShowEmail(!showEmail)}
          className="text-gray-500 hover:text-gray-700 ml-2"
        >
          {showEmail ? <FiEyeOff size={20} /> : <FiEye size={20} />}
        </button>
      </div>
      <div className="flex items-center border  border-gray-300  rounded px-3 py-2 focus-within:ring-2 focus-within:ring-blue-500 mt-2">
          
          <h3 className=" text-black font-semibold">
            Executed Code : <span className=" text-green-500">{profile.executecodecount}</span>
          </h3>
      </div>
      <button
              className="bg-transparent  text-red-500 px-3 py-2 rounded mt-2 border border-blue-800  cursor-pointer"
              onClick={deleteProfile}
              disabled={loading}
              onMouseEnter={() => setShowToolTip(true)}
              onMouseLeave={() =>  setShowToolTip(false)}
            >
              {loading ? "Deleting..." : "Delete Profile"}
      </button> 
      {showToolTip && (
        <div className="absolute top-10 left-1/2 transform -translate-x-1/2 bg-gray-700 text-white text-xs font-semibold px-3 py-1 rounded shadow animate-fadeIn">
          ⚠️ Destructive Action
        </div>
      )}
    </div>
        </div>
  
        {/* Profile Form */}
        <div className=" bg-white p-10 border border-gray-200 w-[50rem] h-[35rem]">
        <div className="flex border-b px-6 pt-4">
          {["Account Settings","API Token"].map((tab) => (
            <button
              key={tab}
              className={`pb-2 px-4 text-sm font-medium ${
                activeTab === tab.toLowerCase().replace(" ", "-")
                  ? "border-b-2 border-blue-600 text-blue-600 mb-2 cursor-pointer"
                  : "text-gray-500"
              }`}
              onClick={() => setActiveTab(tab.toLowerCase().replace(" ", "-"))}
            >
              {tab}
            </button>
          ))}
        </div>
   {activeTab === "account-settings" && (

        <div className="">
          {error && <p className="text-red-500 text-sm mb-2">{error}</p>}
          <div className="grid grid-cols-2 gap-4">
            <div>
                <h3 className= " text-blue-900 mb-3">First name</h3>
            <input
              type="text"
              placeholder="First Name"
              className="input-field text-black"
              value={profile.firstName}
              onChange={(e) => setProfile({ ...profile, firstName: e.target.value })}
              />
              </div>
              <div>
                <h3 className= " text-blue-900 mb-3">Last name</h3>
            <input
              type="text"
              placeholder="Last Name"
              className="input-field text-black"
              value={profile.lastName}
              onChange={(e) => setProfile({ ...profile, lastName: e.target.value })}
              />
              </div>
              <div>
                <h3 className= " text-blue-900 mb-3">Phone Number </h3>
                <input
              type="text"
              placeholder="Phone Number"
              className="input-field  text-black"
              value={profile.phoneNumber}
              onChange={(e) => setProfile({ ...profile, phoneNumber: e.target.value })}
            />
              </div>

            <div>
                <h3 className= " text-blue-900 mb-3">Email Address</h3>
                <input
              type="email"
              placeholder="Email"
              className="input-field text-black"
              value={profile.email}
              onChange={(e) => setProfile({...profile,email:e.target.value})}
              required
            />
            </div>

            <div>
                <h3 className= " text-blue-900 mb-3">City</h3>
                
            <input
              type="text"
              placeholder="City"
              className="input-field text-black"
              value={profile.city}
              onChange={(e) => setProfile({ ...profile, city: e.target.value })}
            />
            </div>

            <div>
                <h3 className= " text-blue-900 mb-3">state</h3>
                <input
              type="text"
              placeholder="State/County"
              className="input-field text-black"
              value={profile.state}
              onChange={(e) => setProfile({ ...profile, state: e.target.value })}
            />
            </div>

            <div>
                <h3 className= " text-blue-900 mb-3">Pincode</h3>
                <input
              type="text"
              placeholder="Postcode"
              className="input-field text-black"
              value={profile.postcode}
              onChange={(e) => setProfile({ ...profile, postcode: e.target.value })}
            />
            </div>

            <div>
                <h3 className= " text-blue-900 mb-3">Country</h3>
                
            <input
              type="text"
              placeholder="Country"
              className="input-field text-black"
              value={profile.country}
              onChange={(e) => setProfile({ ...profile, country: e.target.value })}
            />
            </div>

          </div>
  
          <div className="mt-6 flex space-x-4">
          <button
                className={`bg-blue-600 text-white px-6 py-2 text-sm cursor-pointer ${
                  loading ? "opacity-50 cursor-not-allowed" : ""
                }`}
                onClick={updateProfile}
                disabled={loading}
              >
                {loading ? "Updating..." : "Update"}
              </button>

          <button
          onClick={() => router.push("/landing")}
          className="bg-blue-600 text-white px-6 py-2 text-sm cursor-pointer"
          >
          Go Back

          </button>

          </div>
        </div>

   )}
{activeTab === "api-token" && (
  <div className="bg-white shadow-md rounded-lg p-6 border border-gray-200">
    <h3 className="text-xl font-semibold text-gray-800 mb-4">
      API Token Management
    </h3>

    {/* Generate & Delete Buttons */}
    <div className="flex flex-row items-center justify-center space-x-4 py-4">
      <button
       onClick={generateApitoken}
       className={`bg-blue-600 text-white px-6 py-2 text-sm rounded hover:bg-blue-700 transition duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400 cursor-pointer uppercase ${
         tokenGenerationCount >= 2 ? "opacity-50 cursor-not-allowed" : ""
       }`}
       disabled={!isSubscribed &&  tokenCount >= 2}
      >
        {tokenLoading ? (
          <span className="flex items-center">
            <svg className="animate-spin h-4 w-4 mr-2" viewBox="0 0 24 24">
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v8H4z"
              ></path>
            </svg>
            Generating...
          </span>
        ) : (
          <div className="flex flex-row">
            Generate API Token
            <IoMdKey className="mt-1 ml-2 text-1xl" />
          </div>
        )}
      </button>
{/* 
      <p className="mt-4 text-lg text-gray-700">
                {isSubscribed
                    ? "You have unlimited API tokens."
                    : `You can generate up to 2 tokens. Current: ${tokenCount}`
                }
            </p> */}
      

      <button
        onClick={deleteApitoken}
        className="bg-transparent border border-blue-500 text-red-500 px-6 py-2 text-sm rounded hover:bg-gray-100 transition duration-200 focus:outline-none focus:ring-2 focus:ring-red-400 cursor-pointer uppercase"
        disabled={tokenLoading}
      >
        {tokenLoading ? (
          <span className="flex items-center">
            <svg className="animate-spin h-4 w-4 mr-2" viewBox="0 0 24 24">
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v8H4z"
              ></path>
            </svg>
            Deleting...
          </span>
        ) : (
          "Revoke Token"
        )}
      </button>
      <button 
      onClick={()=> router.push("/subscription")}
      className=" bg-transparent border border-blue-500 rounded px-5 py-2 text-black font-semibold cursor-pointer flex flex-row gap-2">
                    <FaCrown  className=' text-2xl
                    ' /> Go  Pro 
      </button>
    </div>

    {/* Token Display */}
    {apiToken && (
      <div className="mt-4 p-4 bg-gray-50 border border-gray-300 rounded-lg shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-gray-700 font-mono text-sm bg-gray-100 px-4 py-2 rounded-lg border border-gray-300 break-all">
              {apiToken}
            </span>
            <button
              onClick={() => navigator.clipboard.writeText(apiToken)}
              className="text-gray-500 hover:text-gray-700 transition cursor-pointer"
            >
              <MdOutlineFileCopy  className=" text-1xl" />
            </button>
          </div>
        </div>
      </div>
    )}
  </div>
)}


   
    



        </div>

        

      </div>
  
      <style jsx>{`

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-5px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-in-out;
        }
        .input-field {
          border: 1px solid #ddd;
          padding: 10px;
          border-radius: 5px;
          outline: none;
          width: 100%;
        }
        .input-field:focus {
          border-color: #3182ce;
          box-shadow: 0 0 0 2px rgba(49, 130, 206, 0.5);
        }
      `}</style>
    </div>
  );
  
}
