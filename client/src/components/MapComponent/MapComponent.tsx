import { useEffect, useRef } from "react";
import {
  CustomOverlayMap,
  Map,
  MapMarker,
  Polyline,
} from "react-kakao-maps-sdk";
import { useRecoilValue } from "recoil";
import { usePostRoutesToKaKaoMap } from "../../hooks";
import { courseState, pathState } from "../../state";
import { StyledLabel, Wrapper } from "./styles";

export default function MapComponent() {
  const items = useRecoilValue(courseState).items;
  const waypoints = items.map((item) => {
    return {
      x: item.location.lng,
      y: item.location.lat,
    };
  });
  const origin = waypoints.shift();
  const destination = waypoints.pop();

  const { mutate, isLoading } = usePostRoutesToKaKaoMap(
    origin,
    destination,
    waypoints
  );
  useEffect(() => {
    mutate();
  }, []);
  const paths = useRef<{ lat: number; lng: number }[]>([]);
  paths.current = useRecoilValue(pathState).path;
  return (
    <>
      {isLoading ? (
        <>로딩 중...</>
      ) : (
        <Wrapper>
          <Map
            center={
              items[3]
                ? {
                    lat: items[3].location.lat,
                    lng: items[3].location.lng,
                  }
                : {
                    lat: 0,
                    lng: 0,
                  }
            }
            style={{ width: "100%", height: "100vh" }}
            level={8}
          >
            <Polyline
              path={paths.current}
              strokeWeight={3}
              strokeColor={"#1677ff"}
              strokeOpacity={1}
              strokeStyle={"solid"}
            />
            {items.map((loc, idx) => (
              <>
                <CustomOverlayMap position={loc.location} zIndex={1}>
                  <StyledLabel>{idx + 1}</StyledLabel>
                </CustomOverlayMap>
                <MapMarker
                  key={`${loc.children}-${loc.location}`}
                  position={loc.location}
                  image={{
                    src: "./img/marker.png",
                    size: { width: 24, height: 35 },
                  }}
                  title={loc.children}
                />
              </>
            ))}
          </Map>
        </Wrapper>
      )}
    </>
  );
}
