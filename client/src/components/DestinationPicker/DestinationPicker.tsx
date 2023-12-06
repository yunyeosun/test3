import { useState } from "react";
import { NoMarginTitle, Block, StyledButton } from "./styles";
import { DownOutlined } from "@ant-design/icons";
import { useSetRecoilState, useRecoilValue } from "recoil";
import { userState } from "../../state";

export default function DestinationPicker() {
  const [buttonIdx, setButtonIdx] = useState(0);
  const items = [
    "서울",
    "부산",
    "대구",
    "인천",
    "광주",
    "대전",
    "울산",
    "세종",
    "제주",
    "경기",
    "강원",
    "충북",
    "충남",
    "전북",
    "전남",
    "경북",
    "경남",
  ];
  const optionalItems = [
    [
      "가평",
      "동두천",
      "부천",
      "성남",
      "수원",
      "시흥",
      "안산",
      "안성",
      "안양",
      "양주",
      "양평",
      "고양",
      "여주",
      "연천",
      "오산",
      "용인",
      "의왕",
      "의정부",
      "이천",
      "파주",
      "평택",
      "포천",
      "과천",
      "하남",
      "화성",
      "광명",
      "광주",
      "구리",
      "군포",
      "김포",
      "남양주",
    ],
    [
      "강릉",
      "인제",
      "정선",
      "철원",
      "춘천",
      "태백",
      "평창",
      "홍천",
      "화천",
      "횡성",
      "고성",
      "동해",
      "삼척",
      "속초",
      "양구",
      "양양",
      "영월",
      "원주",
    ],
    [
      "괴산",
      "청주",
      "충주",
      "증평",
      "단양",
      "보은",
      "영동",
      "옥천",
      "음성",
      "제천",
      "진천",
    ],
    [
      "공주",
      "예산",
      "천안",
      "청양",
      "태안",
      "홍성",
      "계룡",
      "금산",
      "논산",
      "당진",
      "보령",
      "부여",
      "서산",
      "서천",
      "아산",
    ],
    [
      "고창",
      "임실",
      "장수",
      "전주",
      "정읍",
      "진안",
      "군산",
      "김제",
      "남원",
      "무주",
      "부안",
      "순창",
      "완주",
      "익산",
    ],
    [
      "강진",
      "보성",
      "순천",
      "신안",
      "여수",
      "영광",
      "영암",
      "완도",
      "장성",
      "고흥",
      "장흥",
      "진도",
      "함평",
      "해남",
      "화순",
      "곡성",
      "광양",
      "구례",
      "나주",
      "담양",
      "목포",
      "무안",
    ],
    [
      "경산",
      "성주",
      "안동",
      "안동",
      "영덕",
      "영양",
      "영주",
      "영천",
      "예천",
      "울릉",
      "울진",
      "의성",
      "경주",
      "청도",
      "청송",
      "칠곡",
      "포항",
      "고령",
      "구미",
      "김천",
      "문경",
      "봉화",
      "상주",
    ],
    [
      "거제",
      "양산",
      "의령",
      "진주",
      "창녕",
      "창원",
      "통영",
      "하동",
      "함안",
      "거창",
      "함양",
      "합천",
      "고성",
      "김해",
      "남해",
      "밀양",
      "사천",
      "산청",
    ],
  ];
  const setUser = useSetRecoilState(userState);
  const user = useRecoilValue(userState);
  return (
    <>
      <NoMarginTitle>원하는 지역을 선택해 주세요.</NoMarginTitle>
      <Block>
        {items.map((item, idx) => {
          return (
            <StyledButton
              onClick={() => {
                setButtonIdx(idx);
                setUser({ ...user, travel_destination: item });
              }}
            >
              {item}
            </StyledButton>
          );
        })}
      </Block>
      {buttonIdx >= 9 && (
        <>
          <DownOutlined style={{ marginTop: "30px", color: "#ccc" }} />
          <Block style={{ marginTop: "30px" }}>
            {optionalItems[buttonIdx - 9].map((item) => {
              return (
                <StyledButton
                  onClick={() => setUser({ ...user, travel_destination: item })}
                >
                  {item}
                </StyledButton>
              );
            })}
          </Block>
        </>
      )}
    </>
  );
}
