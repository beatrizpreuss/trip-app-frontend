// This component is used in TripDetails and renders the tables for all categories

import { FaTrash, FaPlus } from "react-icons/fa"

export default function CategoryTable({
    category,
    data,
    setData,
    show,
    setShow,
    columns,       // array of { name, label, type }
    addRow,
    extraFields,
    deleteRow,
    handleMarkerChange
}) {
    if (!data) return null

    const tableNames = {
        stay: ["Stays", "Make a list of all the hotels, camping sites or any other accommodation places relevant to your trip. Include all details and stay organized"],
        eatDrink: ["Eat & Drink", "Make a list of the restaurants you would like to try"],
        explore: ["Explore", "List all the places you would like to see, like museums, monuments, parks, nature attractions, hiking trails, etc."],
        essentials: ["Essentials", "List places that could be helpful to keep your trip up and running, like supermarkets, pharmacies, banks, etc."],
        gettingAround: ["Getting Around", "Airports, train stations, bus stops and such."]
    }

    return (
        <div className="relative overflow-x-auto shadow-md rounded-lg mt-10">
            <table className="table-auto w-full text-sm text-left rtl:text-right text-gray-500 dark:text-[var(--color-stale-blue)]">
                <caption className="items-center justify-between p-5 text-lg font-semibold text-left rtl:text-right text-gray-900 bg-[var(--color-light-blue)] dark:text-[var(--color-stale-blue)] dark:bg-[var(--color-navy)]">
                    <div className="flex flex-col">
                        <div className="flex flex-row">
                            <button onClick={() => setShow(prev => !prev)}>
                                {show ? (
                                    <svg className="w-6 h-6 mr-5 text-gray-800 dark:text-[var(--color-stale-blue)]" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 8">
                                        <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 5.326 5.7a.909.909 0 0 0 1.348 0L13 1" />
                                    </svg>
                                ) : (
                                    <svg className="w-6 h-6 mr-5 text-gray-800 dark:text-[var(--color-stale-blue)]" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 8">
                                        <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7 7.674 1.3a.91.91 0 0 0-1.348 0L1 7" />
                                    </svg>
                                )}
                            </button>
                            <span>{tableNames[category][0]}</span>
                        </div>
                        <p className="mt-1 text-sm font-normal text-gray-500 dark:text-[var(--color-stale-blue)]">
                            {tableNames[category][1]}
                        </p>
                    </div>
                </caption>

                <thead className="text-xs text-gray-700 uppercase bg-gray-100 dark:bg-[var(--color-darker-blue)] dark:text-[var(--color-stale-blue)]">
                    <tr>
                        <th className="px-6 py-3"><span className="sr-only">Details</span></th>
                        {columns.filter(col => {
                            if (['address', 'url', 'coordinates'].includes(col.name)) return false
                            return true
                        }).map(col => <th key={col.name} className="px-6 py-3">{col.label}</th>)}
                        <th className="px-6 py-3"><span className="sr-only">Delete</span></th>
                    </tr>
                </thead>

                {show && (
                    <tbody>
                        {data.filter(item => !item.deleted).map(item => (
                            <tr key={item.id} className="bg-[var(--color-light-blue)] border-b dark:bg-[var(--color-dark-blue)] dark:border-gray-700 border-gray-200">
                                {/* See more column */}
                                <td className="pl-3">
                                    <button
                                        className="cursor-pointer "
                                        onClick={() => {
                                            setData(data => {
                                                return data.map(dataItem => {
                                                    if (dataItem.id == item.id) {
                                                        return { ...dataItem, showPopup: true }
                                                    } else {
                                                        return dataItem
                                                    }
                                                })
                                            })
                                        }}>
                                        See more
                                    </button>
                                </td>

                                {/*  popup logic */}
                                {item.showPopup && <div className="p-5 rounded fixed z-6000 top-1/2 left-1/2 bg-[var(--color-light-blue)] w-3/4 -translate-x-1/2 -translate-y-1/2">
                                
                                        <button onClick={() => {
                                            setData(data => {
                                                return data.map(dataItem => {
                                                    return { ...dataItem, showPopup: false }
                                                })
                                            })
                                        }}>X</button>
                                        {columns.map(col => (
                                            <div key={col.name} className="table-input-box py-2">
                                                <h3 className="font-bold pr-2">{col.label}: </h3>
                                                {col.type === "textarea" ? (
                                                    <textarea
                                                        name={col.name}
                                                        rows={2}
                                                        value={item[col.name] ?? ""}
                                                        className="table-input-field min-w-50"
                                                        onChange={(e) => handleMarkerChange(category, item.id, col.name, e.target.value)}
                                                    />
                                                ) : (
                                                    <input
                                                        name={col.name}
                                                        type={col.type}
                                                        value={item[col.name] ?? ""}
                                                        className="table-input-field"
                                                        onChange={(e) => handleMarkerChange(category, item.id, col.name, e.target.value)}
                                                    />
                                                )}
                                            </div>
                                        ))}
                                        <div className="table-input-box py-2">
                                            <h3 className="font-bold pr-2">Coordinates: </h3>
                                            <input
                                                name="latLong"
                                                type="text"
                                                value={item.latLong ?? ""}
                                                className="table-input-field text-s"
                                                onChange={e => handleMarkerChange(category, item.id, "latLong", e.target.value)}
                                            />

                                        </div>
                                    
                                </div>}
                                {columns.filter(col => {
                                    if (['address', 'url', 'coordinates'].includes(col.name)) return false
                                    return true
                                }).map(col => (
                                    <td key={col.name} className="table-input-box">
                                        {col.type === "textarea" ? (
                                            <textarea
                                                name={col.name}
                                                rows={2}
                                                value={item[col.name] ?? ""}
                                                className="table-input-field min-w-50"
                                                onChange={(e) => handleMarkerChange(category, item.id, col.name, e.target.value)}
                                            />
                                        ) : (
                                            <input
                                                name={col.name}
                                                type={col.type}
                                                value={item[col.name] ?? ""}
                                                className="table-input-field"
                                                onChange={(e) => handleMarkerChange(category, item.id, col.name, e.target.value)}
                                            />
                                        )}
                                    </td>
                                ))}

                                <td className="px-6 py-4 text-right sticky right-0 bg-[var(--color-light-blue)] dark:bg-[var(--color-dark-blue)] z-10">
                                    <button
                                        onClick={() => deleteRow(item.id, setData)}
                                        className="font-medium text-[var(--color-crimson)] dark:text-red-400 hover:underline cursor-pointer"
                                    >
                                        <FaTrash />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                )}
            </table>

            <button
                onClick={() => addRow(setData, extraFields)}
                className="add-row-button"
            >
                <div className="flex flex-row items-center">
                    <FaPlus />
                    <span> Add {category}</span>
                </div>
            </button>
        </div>
    )
}
