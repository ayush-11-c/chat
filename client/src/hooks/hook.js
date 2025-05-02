import { useEffect, useState } from "react";
import toast from "react-hot-toast";

const useErrors = (errors = []) => {
  useEffect(() => {
    errors.forEach((i) => {
      if (!i) return;
      const { isError, error, fallback } = i;
      if (isError) {
        if (fallback) fallback();
        else toast.error(error?.data?.message || "Something went wrong");
      }
    });
  }, [errors]);
};

const useAsyncMutation = (mutationHook) => {
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState(null);
  const [mutate] = mutationHook();
  const executeMutation = async (toastMessage, ...arg) => {
    setIsLoading(true);
    const toastId = toast.loading(toastMessage || "Loading...");
    try {
      const res = await mutate(...arg);
      if (res.data) {
        toast.success(res.data.message || "Successfully Loaded", {
          id: toastId,
        });
        setData(res.data);
      } else {
        toast.error(res.error.data.message || "Something went wrong", {
          id: toastId,
        });
      }
    } catch (error) {
      console.log(error);
      toast.error("Something went wrong", { id: toastId });
    } finally {
      setIsLoading(false);
    }
  };
  return [executeMutation, isLoading, data];
};
const useSocketEvents = (socket, handlers) => {
  useEffect(() => {
    if (!socket) {
      console.log("Socket is not initialized");
      return;
    }

    Object.entries(handlers).forEach(([event, handler]) => {
      socket.on(event, handler);
    });

    return () => {
      Object.entries(handlers).forEach(([event, handler]) => {
        socket.off(event, handler);
      });
    };
  }, [socket, handlers]);
};

export { useErrors, useAsyncMutation, useSocketEvents };
