import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface ModalState {
    isOpen: boolean;
    type: string | null;
    data: any;
    id: any;
}

const initialState: ModalState = {
    isOpen: false,
    type: null,
    data: null,
    id: null
};

const modalSlice = createSlice({
    name: 'modal',
    initialState,
    reducers: {
        openModal: (
            state,
            action: PayloadAction<{ type: string; data?: any; id?: any }>
        ) => {
            state.isOpen = true;
            state.type = action.payload.type;
            state.data = action.payload.data || null;
            state.id = action.payload.id || null;
        },
        closeModal: (state) => {
            state.isOpen = false;
            state.type = null;
            state.data = null;
            state.id = null;
        },
    },
});

export const { openModal, closeModal } = modalSlice.actions;
export default modalSlice.reducer;
