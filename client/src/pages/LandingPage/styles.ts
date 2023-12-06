import { Button, Layout } from 'antd';
import styled from 'styled-components';

export const Block = styled(Layout)`
    background-color: #fff;
    justify-content: center;
    .ant-steps .ant-steps-item-icon .ant-steps-icon {
        top: -1.8px;
    }
    gap: 40px;
`;
export const ContentBox = styled.div`
    min-width: 40vw;
    max-width: 40vw;
    border: 1px solid #ebebeb;
    border-radius: 8px;
    padding: 60px;
    text-align: center;
    display: flex;
    justify-content: center;
    flex-direction: column;
`;
export const NextButton = styled(Button)`
    width: 10vw;
    padding: 30px 0;
    font-size: 20px;
    font-weight: bold;
    margin: 60px auto;
    margin-bottom: 0px;
    display: flex;
    align-items: center;
    justify-content: center;
`;
