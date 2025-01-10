import React from 'react';

const Loader = ({ message }) => {
    return (
        <div className="fixed inset-0 flex flex-col items-center justify-center bg-white bg-opacity-75">
            <div className="loader animate-spin border-4 border-t-[#F24C27] border-gray-300 rounded-full h-16 w-16"></div>
            {message && (
                <p className="mt-4 text-gray-700 text-center">
                    {message}
                </p>
            )}
        </div>
    );
};

export default Loader;
