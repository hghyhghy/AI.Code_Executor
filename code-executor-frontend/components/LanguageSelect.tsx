

'use client';
interface Props {

    language:string;
    setLanguage:(lang:string) => void;

}

const LanguageSelect:React.FC<Props> = ({language,setLanguage}) => {
    return (

        <div className=" mb-4">
            <label className=" block text-gray-300 mb-2">Select Language:</label>
            <select
            className="w-full bg-gray-800 text-white p-2 rounded"
            value={language}
            onChange={(e) =>  setLanguage(e.target.value)}
            >
                <option value="python">Python</option>
                <option value="javascript"> Javascript </option>
                <option value="go">Go </option>

            </select>
        </div>
    )

}

export default LanguageSelect;