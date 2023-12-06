import { DirectionsRenderer, DirectionsService } from "@react-google-maps/api";
import { useEffect, useMemo, useRef, useState } from "react";

export default function DirectionComponent() {
  const [directions, setDirections] = useState();
  const origin = { lat: 33.49973767113089, lng: 126.51496907730743 };
  const destination = { lat: 33.46995188019252, lng: 126.49324259353943 };
  const count = useRef(0);
  const options = {
    polylineOptions: {
      strokeColor: "red",
      strokeWeight: 6,
      strokeOpacity: 0.8,
    },
  };
  useEffect(() => {
    count.current = 0;
  }, []);
  const directionsCallback = (result: any, status: any) => {
    console.log(result.request.destination.location.lat);
    if (status === "OK" && count.current === 0) {
      count.current += 1;
      setDirections(result);
    }
  };
  return (
    <>
      <DirectionsService
        options={{
          origin: origin,
          destination: destination,
          travelMode: google.maps.TravelMode.TRANSIT,
        }}
        callback={directionsCallback}
      />
      <DirectionsRenderer directions={directions} options={options} />
    </>
  );
}
