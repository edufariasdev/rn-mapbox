import React from 'react';

import { render } from '@testing-library/react-native';

import {App} from '../app';

describe("App Main", () => {
    
    it('verifica text renderiza texto correto', async () => {
        const { getByText } = render(<App/>);
        const text = getByText("Maps");
        expect(text.props.children).toBeTruthy();
    });
    
    it('verificar id render texto', () => {
        const { getByTestId } = render(<App/>);
    
        const textMain = getByTestId('text-main');
    
        expect(textMain.props.children).toEqual('Maps');
    });
    
    it('verificar se o title renderizou correto', () => {
        const {getByTestId} = render(<App/>);
    
        const textTitle = getByTestId('text-main');
        
        expect(textTitle.props.children).toContain('Maps')
    });
})