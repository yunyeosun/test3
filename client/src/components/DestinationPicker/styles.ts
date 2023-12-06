import { Button, Typography } from 'antd';
import styled from 'styled-components';
const { Title } = Typography;

export const NoMarginTitle = styled(Title)`
    margin: 0 0 60px !important;
`;
export const Block = styled.div`
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 10px;
`;
export const StyledButton = styled(Button)`
    &:hover {
        color: #fff;
    }
    &:focus {
        outline: none !important;
        background-color: #1677ff;
        color: #fff;
    }
`;