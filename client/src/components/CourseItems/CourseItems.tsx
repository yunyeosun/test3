import { Block, Content, ImageContainer, StyledTitle } from "./styles";
import { EnvironmentOutlined, FileImageOutlined } from "@ant-design/icons";

interface CourseItems {
  title: string;
  address: string;
  type: string;
  img?: string;
}
export default function CourseItems({
  title,
  address,
  type,
  img,
}: CourseItems) {
  return (
    <Block>
      <ImageContainer>
        {img ? (
          <img
            src={img}
            style={{ width: "160px", height: "100px", objectFit: "cover" }}
          />
        ) : (
          <FileImageOutlined width={24} />
        )}
      </ImageContainer>
      <Content>
        <span>{type}</span>
        <StyledTitle level={4}>{title}</StyledTitle>
        <div>
          <EnvironmentOutlined />
          <span>{address}</span>
        </div>
      </Content>
    </Block>
  );
}
