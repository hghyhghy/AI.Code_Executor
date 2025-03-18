
'use client';
import { useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
const SubscriptionPage =()=>{
    const [loading, setLoading] = useState(false)
    const [status, setStatus] = useState("")
    const token =  Cookies.get('token')
    const router =  useRouter()



    const subscribe = async(planType:string) => {

        try {
            setLoading(true)
            await axios.post("http://localhost:3001/subscription/subscribe",
                {planType},
            
            {headers:{ Authorization: `Bearer ${token}`}})
            alert(`Subscribed to ${planType} plan`);
            router.push("/userprofile")
        } catch (error) {
            console.error("subscription failed")
            alert("subscription failed")
        }finally{
            setLoading(false)
        }
    }

    const  unsubscribe=async() => {
        try {
            setLoading(true)
            await axios.delete("http://localhost:3001/subscription/unsubscribe",{
                headers:{
                    Authorization:`Bearer ${token}`
                }
            });
            alert("unsubscribed successfully")
            router.push("/userprofile")
        } catch (error) {
            console.error(error);
            alert("Unsubscription failed");
        } finally{
            setLoading(false)
        }
    }

    const checkStatus=async()=>{
        try {
            setLoading(true)
            const response = await axios.get("http://localhost:3001/subscription/status", {
                headers:{
                    Authorization: `Bearer ${token}`
                }
            })
            setStatus(response.data.status)
        } catch (error) {
            console.error(error);
            alert("Failed to check status");
        }finally{
            setLoading(false)
        }
        
    }
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-6">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">Choose Your Plan</h2>
          <p className="text-gray-500 mb-6">Choose the right program for your business</p>
    
          <div className="flex space-x-6">
                {[
                    {
                        name: "Individual",
                        price: 29,
                        features: ["Unlimited sending", "Email marketing", "Send newsletters"],
                        color: "border-purple-500"
                    },
                    {
                        name: "Standard",
                        price: 89,
                        features: ["Unlimited sending", "Email marketing", "Send newsletters", "Marketing automation"],
                        color: "border-purple-700"
                    },
                    {
                        name: "Pro",
                        price: 159,
                        features: ["Unlimited sending", "Email marketing", "Send newsletters", "Marketing automation", "Email support", "Free design services"],
                        color: "border-green-500"
                    }
                ].map((plan) => (
                    <div key={plan.name} className={`border ${plan.color} p-6 rounded-lg shadow-lg bg-white w-72 text-center flex flex-col h-96 
                    transition-transform duration-300 ease-in-out transform  hover:scale-110 hover:cursor-pointer`}>
                        <h3 className="text-xl font-semibold text-gray-800">{plan.name}</h3>
                        <p className="text-3xl font-bold text-gray-800 mt-2">
                            ${plan.price} <span className="text-gray-500 text-sm">/month</span>
                        </p>
                        <ul className="mt-4 text-gray-600 space-y-2 text-left pl-6">
                            {plan.features.map((feature, index) => (
                                <li key={index} className="flex items-center space-x-2">
                                    <span className="text-green-500">✔</span> <span>{feature}</span>
                                </li>
                            ))}
                        </ul>
                        {/* This button is pushed to the bottom */}
                        <button
                            onClick={() => subscribe(plan.name)}
                            className="mt-auto w-full bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 transition cursor-pointer"
                            disabled={loading}
                        >
                            {loading ? "Subscribing..." : "Subscribe"}
                        </button>
                    </div>
                ))}
            </div>
    
          <div className="mt-8 flex space-x-4">
            <button
              onClick={unsubscribe}
              className="bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600 transition"
              disabled={loading}
            >
              {loading ? "Unsubscribing..." : "Unsubscribe"}
            </button>
            <button
              onClick={checkStatus}
              className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition"
              disabled={loading}
            >
              {loading ? "Checking..." : "Check Status"}
            </button>
          </div>
    
          {status && <p className="mt-4 text-lg text-gray-700">Current Status: {status}</p>}
        </div>
      );
}

export default SubscriptionPage