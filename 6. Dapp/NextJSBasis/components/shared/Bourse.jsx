'use client';
import { useState, useEffect } from "react"
import axios from "axios"

const Bourse = () => {

    const [isLoading, setIsLoading] = useState(true);
    const [data, setData] = useState([]);

    useEffect(() => {
        const fetchData = async() => {
            try {
                const response = await axios.get('https://dumbstockapi.com/stock?exchange=NYSE');
                setData(response.data);
            }
            catch(error) {
                console.log(error)
            }
            finally {
                setIsLoading(false);
            }
        }
        fetchData();

        return () => {
            // Qu'est ce qu'il se passe lorsque le composant est démonté
        }
    }, [])

    return (
        <div className="max-w-7xl mx-auto p-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">NYSE Stock Exchange</h2>
            {isLoading ? (
                <div className="flex justify-center items-center min-h-[200px]">
                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-gray-800" />
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {data.map(item => (
                        <div 
                            key={item.ticker} 
                            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-300 hover:-translate-y-1"
                        >
                            <h3 className="text-xl font-semibold text-gray-800 mb-2">{item.name}</h3>
                            <p className="text-gray-600">{item.ticker}</p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

export default Bourse