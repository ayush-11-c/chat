import { createSlice } from "@reduxjs/toolkit";
import { getFromStorage } from "../../lib/features";
import { NEW_MESSAGE_ALLERT } from "../../constants/event";

const initialState = {
  notificationsCount: 0,
  newMessageAllert: getFromStorage({ key: NEW_MESSAGE_ALLERT, get: true }) || [
    {
      chatId: "",
      count: 0,
    },
  ],
};

const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    incrimentNotificationsCount: (state) => {
      state.notificationsCount += 1;
    },
    resetNotificationsCount: (state) => {
      state.notificationsCount = 0;
    },
    setNewMessageAllert: (state, action) => {
      const { chatId } = action.payload;
      const index = state.newMessageAllert.findIndex(
        (item) => item.chatId === chatId
      );
      if (index !== -1) {
        state.newMessageAllert[index].count += 1;
      } else {
        state.newMessageAllert.push({ chatId, count: 1 });
      }
    },
    removeNewMessageAllertt: (state, action) => {
      state.newMessageAllert = state.newMessageAllert.filter(
        (item) => item.chatId !== action.payload.chatId
      );
    },
  },
});

export default chatSlice;

export const {
  incrimentNotificationsCount,
  resetNotificationsCount,
  setNewMessageAllert,
  removeNewMessageAllertt,
} = chatSlice.actions;
