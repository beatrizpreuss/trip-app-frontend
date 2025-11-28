
// This component is used in TripMap to display a marker and allow it to be draggable,
// but asks for confirmation before moving. Also has a general rendering of the popup,
// so there is no need to render a different popup for each category

import { useMap, Marker, Popup } from "react-leaflet";

export default function DraggableMarker({ marker, category, onConfirmMove, icon, handleMarkerFieldChange, handleDeleteMarker }) {
    // Safety check
    if (!marker || !marker.latLong) return null;

    const map = useMap();

    const categoryFieldConfig = {
        stay: [
            { name: "name", label: "Name", type: "text" },
            { name: "status", label: "Status", type: "text" },
            { name: "price", label: "Price", type: "text" },
            { name: "address", label: "Address", type: "text" },
            { name: "day", label: "Day", type: "text" },
            { name: "url", label: "URL", type: "text" },
            { name: "comments", label: "Comments", type: "textarea" }
        ],

        eatDrink: [
            { name: "name", label: "Name", type: "text" },
            { name: "address", label: "Address", type: "text" },
            { name: "day", label: "Day", type: "text" },
            { name: "url", label: "URL", type: "text" },
            { name: "comments", label: "Comments", type: "textarea" }
        ],

        explore: [
            { name: "name", label: "Name", type: "text" },
            { name: "price", label: "Price", type: "text" },
            { name: "address", label: "Address", type: "text" },
            { name: "day", label: "Day", type: "text" },
            { name: "url", label: "URL", type: "text" },
            { name: "comments", label: "Comments", type: "textarea" }
        ],

        essentials: [
            { name: "name", label: "Name", type: "text" },
            { name: "address", label: "Address", type: "text" },
            { name: "day", label: "Day", type: "text" },
            { name: "url", label: "URL", type: "text" },
            { name: "comments", label: "Comments", type: "textarea" }
        ],

        gettingAround: [
            { name: "name", label: "Name", type: "text" },
            { name: "address", label: "Address", type: "text" },
            { name: "day", label: "Day", type: "text" },
            { name: "url", label: "URL", type: "text" },
            { name: "comments", label: "Comments", type: "textarea" }
        ]
    }

    // Popup function with confirm + cancel
    const openDragConfirmPopup = (lat, lng, onConfirm, onCancel) => {
        const popup = L.popup().setLatLng([lat, lng]).openOn(map);

        const container = document.createElement("div");
        container.className = "flex flex-col items-center gap-2";

        const text = document.createElement("p");
        text.textContent = "Move marker here?";
        text.className = "text-sm";
        container.appendChild(text);

        const btnYes = document.createElement("button");
        btnYes.textContent = "Yes";
        btnYes.className = "general-button my-0 w-20 text-xs";
        container.appendChild(btnYes);

        const btnNo = document.createElement("button");
        btnNo.textContent = "No";
        btnNo.className = "general-button bg-gray-300 my-0 w-20 text-xs";
        container.appendChild(btnNo);

        popup.setContent(container);

        btnYes.addEventListener("click", () => {
            onConfirm();
            map.closePopup();
        });

        btnNo.addEventListener("click", () => {
            onCancel?.();
            map.closePopup();
        });
    };

    return (
        <Marker
            position={marker.latLong}
            icon={icon} // use icon prop
            draggable={true}
            eventHandlers={{
                dragend: (event) => {
                    const leafletMarker = event.target // Leaflet marker instance
                    const newLatLong = [
                        leafletMarker.getLatLng().lat,
                        leafletMarker.getLatLng().lng,
                    ];

                    openDragConfirmPopup(
                        newLatLong[0],
                        newLatLong[1],
                        () => onConfirmMove(category, marker.id, newLatLong),
                        () => {
                            // Snap back to original position if cancelled
                            leafletMarker.setLatLng(marker.latLong)
                        }
                    )
                },

            }}
        >
            <Popup>
                <div className="space-x-2">
                    {categoryFieldConfig[category]?.map((field) => (
                        <label key={field.name} className="popup-label">
                            {field.label}:
                            {field.type === "textarea" ? (
                                <textarea
                                    className="popup-input w-full bg-gray-200"
                                    name={field.name}
                                    value={marker[field.name] ?? ""}
                                    onChange={(event) =>
                                        handleMarkerFieldChange(category, marker.id, field.name, event.target.value)
                                    }
                                ></textarea>
                            ) : (
                                <input
                                    className="popup-input"
                                    type={field.type}
                                    name={field.name}
                                    value={marker[field.name] ?? ""}
                                    onChange={(event) =>
                                        handleMarkerFieldChange(
                                            category,
                                            marker.id,
                                            field.name,
                                            event.target.value
                                        )
                                    }
                                />
                            )}
                        </label>
                    ))}
                    <button
                        className="delete-marker-button"
                        onClick={(e) => {
                            e.stopPropagation()
                            handleDeleteMarker(category, marker.id)
                        }}
                    >
                        Delete
                    </button>
                </div>
            </Popup>
        </ Marker>
    );
}
