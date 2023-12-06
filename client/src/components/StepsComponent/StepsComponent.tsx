import { Steps } from "antd";

interface StepsComponentProps {
  current: number;
}
export default function StepsComponent({ current }: StepsComponentProps) {
  return (
    <>
      <Steps
        current={current}
        items={[
          {
            title: "지역 선택",
          },
          {
            title: "일정 선택",
          },
          {
            title: "선호 여행 스타일",
          },
        ]}
      />
    </>
  );
}
