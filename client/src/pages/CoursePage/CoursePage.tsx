import { useEffect } from "react";
import { usePostPersonality } from "../../hooks";
import { CourseSideBar, MapComponent } from "../../components";
import { Block, Container } from "./styles";
import { useRecoilValue, useSetRecoilState } from "recoil";
import { travelState, userState } from "../../state";
import { Spin } from "antd";

export default function CoursePage() {
  const user = useRecoilValue(userState);
  const { mutate, isLoading } = usePostPersonality(user);
  const setTravel = useSetRecoilState(travelState);
  setTravel(user.travel_destination);
  useEffect(() => {
    mutate();
  }, []);
  return (
    <Block>
      {isLoading ? (
        <Spin />
      ) : (
        <>
          <CourseSideBar />
          <Container>
            <MapComponent />
          </Container>
        </>
      )}
    </Block>
  );
}
