import { Card } from "antd";
import { Dispatch, SetStateAction } from "react";
import { useSetRecoilState, useRecoilValue } from "recoil";
import { userState } from "../../state";
import { CardCircle } from "./styles";

interface CardComponentType {
  title: string;
  src: string;
  setSelected: Dispatch<SetStateAction<number[]>>;
  idx: number;
  count: React.MutableRefObject<number>;
  selected: number[];
  type: string;
}
const { Meta } = Card;
export default function CardComponent({
  title,
  src,
  setSelected,
  idx,
  selected,
  count,
  type,
}: CardComponentType) {
  const setUser = useSetRecoilState(userState);
  const user = useRecoilValue(userState);
  const HandleSelect = () => {
    if (selected[idx] < 1) {
      selected[idx] += count.current;
      count.current++;
    } else {
      selected.forEach((item, index) => {
        if (item > selected[idx]) {
          selected[index]--;
        }
      });
      count.current--;
      selected[idx] = 0;
    }
    setSelected([...selected]);
    switch (type) {
      case "destination": {
        setUser({
          ...user,
          rank_mountain: selected[0],
          rank_sea: selected[1],
          rank_historicalTheme: selected[2],
          rank_experienceTheme: selected[3],
          rank_buildingTheme: selected[4],
          rank_cafe: selected[5],
        });
        break;
      }
      case "food": {
        setUser({
          ...user,
          rank_koreanfood: selected[0],
          rank_japanesefood: selected[1],
          rank_chinesefood: selected[2],
          rank_westernfood: selected[3],
          rank_fastfood: selected[4],
          rank_meat: selected[5],
        });
        break;
      }
      default: {
        setUser({
          ...user,
          rank_hotel: selected[0],
          rank_motel: selected[1],
          rank_pension: selected[2],
        });
      }
    }
  };
  return (
    <Card
      onClick={() => HandleSelect()}
      hoverable
      style={{
        width: 200,
        outline: selected[idx] > 0 ? "3px solid #80b5ff" : "none",
      }}
      cover={
        <>
          <img style={{ height: 114 }} alt="example" src={src} />
          {selected[idx] > 0 && (
            <CardCircle>
              <span>{selected[idx]}</span>
            </CardCircle>
          )}
        </>
      }
    >
      <Meta title={title} />
    </Card>
  );
}
