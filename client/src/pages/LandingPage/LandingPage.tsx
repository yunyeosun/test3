import {
  DestinationPicker,
  StepsComponent,
  SchedulePicker,
  DestinationCards,
  AccommodationCards,
  FoodCards,
} from "../../components";
import { Block, ContentBox, NextButton } from "./styles";
import { useState } from "react";
import { useTransition, animated } from "@react-spring/web";
import { useNavigate } from "react-router-dom";

export default function LandingPage() {
  const [page, setPage] = useState(0);
  const [steps, setSteps] = useState(0);
  const navigate = useNavigate();
  const items = [
    () => page === 0 && <DestinationPicker />,
    () => page === 1 && <SchedulePicker />,
    () => page === 2 && <DestinationCards />,
    () => page === 3 && <AccommodationCards />,
    () => page === 4 && <FoodCards />,
    () => (
      <NextButton
        onClick={() => {
          setPage((page) => page + 1);
          if (steps === 0 || steps === 1) {
            setSteps((steps) => steps + 1);
          }
          if (page >= 4) navigate("/course");
        }}
        type="primary"
      >
        다음
      </NextButton>
    ),
  ];

  const duration = 300;
  const translateY = 4;

  const transition = useTransition(items, {
    from: { opacity: 0, transform: `translateY(${translateY}px)` },
    enter: { opacity: 1, transform: `translateY(0)` },
    config: { duration: duration },
  });

  return (
    <Block>
      <StepsComponent current={steps} />
      <ContentBox>
        {transition((styles, item) => (
          <animated.div style={styles}>{item()}</animated.div>
        ))}
      </ContentBox>
    </Block>
  );
}
