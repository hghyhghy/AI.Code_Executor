

import axios from "axios";

const API_URL = "http://localhost:3001/execute/code";
const API_URL1 = "http://localhost:3001/execute/suggest";

export const executeCode =  async (code:string,language:string) => {
    try {

        const token =  localStorage.getItem("token")
        if (!token) {
            throw new Error("User not authenticated");
        }
        const response  = await axios.post(API_URL,{code,language},
            {
                headers:{
                    Authorization: `Bearer ${token}`
                }
            }
        )
        return response.data.output
        
    } catch (error) {
        console.error("Error executing code:", error);
        return "Execution error";
        
    }
}


export const getCodeSuggestion =  async(language:string,currentCode:string) => {
    try {
        const token  =  localStorage.getItem("token")
        const response  =  await axios.post(API_URL1,{language,currentCode},{
            headers:{
                Authorization: `Bearer ${token}`
            }
        })
        return response.data

        
    } catch (error) {
        console.error("Error fetching code suggestion:", error);
        return "Error generating suggestion";
        
    }

}