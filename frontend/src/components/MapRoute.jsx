import React, { useState, useCallback, useEffect } from "react";
import {
    GoogleMap,
    LoadScript,
    DirectionsService,
    DirectionsRenderer,
} from "@react-google-maps/api";

const containerStyle = {
    width: "100%",
    height: "400px",
};

const center = {
    lat: 45.8150,
    lng: 15.9819,
};

const MapRoute = ({ hoveredAd }) => {
    const [directionsResponse, setDirectionsResponse] = useState(null);
    const [responseError, setResponseError] = useState(null);

    const directionsCallback = useCallback((response) => {
        if (response !== null) {
            if (response.status === "OK") {
                setDirectionsResponse(response);
                setResponseError(null);
            } else {
                setResponseError("Nije moguće pronaći rutu.");
            }
        }
    }, []);

    useEffect(() => {
        setDirectionsResponse(null);
        setResponseError(null);
    }, [hoveredAd]);

    return (
        <div>
            <LoadScript googleMapsApiKey="REMOVED_API_KEY">
                <GoogleMap mapContainerStyle={containerStyle} center={center} zoom={10}>
                    {hoveredAd && hoveredAd.A && hoveredAd.B && (
                        <DirectionsService
                            options={{
                                origin: hoveredAd.A,
                                destination: hoveredAd.B,
                                travelMode: "DRIVING",
                            }}
                            callback={directionsCallback}
                        />
                    )}
                    {directionsResponse && <DirectionsRenderer directions={directionsResponse} />}
                </GoogleMap>
            </LoadScript>
            {responseError && <p className="error">{responseError}</p>}
        </div>
    );
};

export default MapRoute;